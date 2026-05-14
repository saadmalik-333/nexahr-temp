import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase';
import { sendRejectionEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId: empUuid } = await request.json();

    if (!empUuid) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Get employee
    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', empUuid)
      .single();

    if (fetchError || !employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    if (employee.status !== 'pending') {
      return NextResponse.json(
        { error: `Employee is already ${employee.status}` },
        { status: 400 }
      );
    }

    // Update employee status
    const { error: updateError } = await supabase
      .from('employees')
      .update({
        status: 'declined',
        updated_at: new Date().toISOString(),
      })
      .eq('id', empUuid);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to decline employee' }, { status: 500 });
    }

    // Send rejection email
    await sendRejectionEmail({
      name: employee.full_name,
      email: employee.email,
    });

    // Log email
    await supabase.from('email_logs').insert({
      employee_id: empUuid,
      email_type: 'rejection',
      sent_to: employee.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Employee declined',
    });
  } catch (error) {
    console.error('Decline error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

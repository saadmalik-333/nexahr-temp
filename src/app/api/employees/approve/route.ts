import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase';
import { generateEmployeeId } from '@/lib/utils';
import { sendApprovalEmail } from '@/lib/email';

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

    // Get count of approved employees to generate next employee ID
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .not('employee_id', 'is', null);

    const nextNumber = (count || 0) + 1;
    const generatedId = generateEmployeeId(nextNumber);
    const today = new Date().toISOString().split('T')[0];

    // Update employee
    const { error: updateError } = await supabase
      .from('employees')
      .update({
        status: 'approved',
        employee_id: generatedId,
        join_date: today,
        approved_by: (session.user as any).id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', empUuid);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to approve employee' }, { status: 500 });
    }

    // Send approval email
    await sendApprovalEmail({
      name: employee.full_name,
      email: employee.email,
      employeeId: generatedId,
      designation: employee.designation,
      department: employee.department,
      joinDate: today,
    });

    // Log email
    await supabase.from('email_logs').insert({
      employee_id: empUuid,
      email_type: 'approval',
      sent_to: employee.email,
    });

    return NextResponse.json({
      success: true,
      employeeId: generatedId,
      message: 'Employee approved successfully',
    });
  } catch (error) {
    console.error('Approve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

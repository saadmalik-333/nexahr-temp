import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let query = supabase.from('attendance').select('*');

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (date) {
      query = query.eq('date', date);
    }

    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    query = query.order('date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();

    // body can be a single record or array of records
    const records = Array.isArray(body) ? body : [body];

    // Upsert attendance records (unique on employee_id + date)
    const { error } = await supabase
      .from('attendance')
      .upsert(
        records.map((r: any) => ({
          employee_id: r.employee_id,
          date: r.date,
          status: r.status,
          check_in_time: r.check_in_time || null,
          check_out_time: r.check_out_time || null,
          notes: r.notes || null,
          marked_by: r.marked_by || null,
        })),
        { onConflict: 'employee_id,date' }
      );

    if (error) {
      console.error('Attendance insert error:', error);
      return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Attendance saved' });
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

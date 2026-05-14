'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AttendanceRecord {
  date: string;
  status: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PortalAttendancePage() {
  const [session, setSession] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, halfDay: 0 });

  useEffect(() => {
    const stored = localStorage.getItem('portal_session');
    if (stored) setSession(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (session) fetchAttendance();
  }, [session, currentDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    const month = (currentDate.getMonth() + 1).toString();
    const year = currentDate.getFullYear().toString();
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;

    const { data } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('employee_id', session.id)
      .gte('date', startDate)
      .lte('date', endDate);

    const map: Record<string, string> = {};
    let p = 0, a = 0, l = 0, h = 0;
    data?.forEach(r => {
      map[r.date] = r.status;
      if (r.status === 'present') p++;
      else if (r.status === 'absent') a++;
      else if (r.status === 'late') l++;
      else if (r.status === 'half-day') h++;
    });
    setAttendance(map);
    setSummary({ present: p, absent: a, late: l, halfDay: h });
    setLoading(false);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-success/20 text-success border-success/30';
      case 'absent': return 'bg-danger/20 text-danger border-danger/30';
      case 'late': return 'bg-warning/20 text-warning border-warning/30';
      case 'half-day': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-surface text-text-secondary border-border';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'present': return 'bg-success';
      case 'absent': return 'bg-danger';
      case 'late': return 'bg-warning';
      case 'half-day': return 'bg-orange-400';
      default: return 'bg-gray-600';
    }
  };

  const { firstDay, daysInMonth } = getDaysInMonth();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">My Attendance</h1>
        <p className="text-text-secondary mt-1">View your monthly attendance records</p>
      </div>

      {/* Calendar */}
      <div className="glass-card p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-surface border border-border transition-colors">
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h2 className="font-heading text-xl font-semibold text-text-primary">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-surface border border-border transition-colors">
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-text-secondary py-2">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const status = attendance[dateStr];
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div
                key={day}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  status ? getStatusColor(status) : 'bg-background border-border'
                } ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              >
                <span className={`text-sm font-medium ${status ? '' : 'text-text-secondary'}`}>{day}</span>
                {status && <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(status)}`} />}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-border">
          {[
            { label: 'Present', color: 'bg-success' },
            { label: 'Absent', color: 'bg-danger' },
            { label: 'Late', color: 'bg-warning' },
            { label: 'Half-day', color: 'bg-orange-400' },
            { label: 'No Record', color: 'bg-gray-600' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-xs text-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card text-center">
          <p className="text-3xl font-heading font-bold text-success">{summary.present}</p>
          <p className="text-sm text-text-secondary mt-1">Present</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-3xl font-heading font-bold text-danger">{summary.absent}</p>
          <p className="text-sm text-text-secondary mt-1">Absent</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-3xl font-heading font-bold text-warning">{summary.late}</p>
          <p className="text-sm text-text-secondary mt-1">Late</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-3xl font-heading font-bold text-orange-400">{summary.halfDay}</p>
          <p className="text-sm text-text-secondary mt-1">Half-day</p>
        </div>
      </div>
    </div>
  );
}

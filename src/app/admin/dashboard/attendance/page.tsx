'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Save, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  designation: string;
  department: string;
  photo_url: string;
}

interface AttendanceRecord {
  employee_id: string;
  status: string;
}

const statuses = ['present', 'absent', 'late', 'half-day'];

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    const { data: emps } = await supabase.from('employees').select('id, employee_id, full_name, designation, department, photo_url').eq('status', 'approved').order('full_name');
    if (emps) setEmployees(emps);

    const { data: att } = await supabase.from('attendance').select('employee_id, status').eq('date', selectedDate);
    const map: Record<string, string> = {};
    att?.forEach(a => { map[a.employee_id] = a.status; });
    setAttendance(map);
    setLoading(false);
  };

  const setStatus = (empId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [empId]: status }));
  };

  const markAllPresent = () => {
    const map: Record<string, string> = {};
    employees.forEach(e => { map[e.id] = 'present'; });
    setAttendance(map);
    toast.success('All marked as present');
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([empId, status]) => ({
        employee_id: empId,
        date: selectedDate,
        status,
      }));
      if (records.length === 0) { toast.error('No attendance to save'); setSaving(false); return; }
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records),
      });
      if (res.ok) toast.success('Attendance saved!');
      else toast.error('Failed to save');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const statusColors: Record<string, string> = {
    present: 'bg-success/15 text-success border-success/30',
    absent: 'bg-danger/15 text-danger border-danger/30',
    late: 'bg-warning/15 text-warning border-warning/30',
    'half-day': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="spinner" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="section-title">Attendance</h1><p className="text-text-secondary mt-1">Mark and manage daily attendance</p></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarCheck className="w-5 h-5 text-primary" />
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={markAllPresent} className="btn-secondary flex items-center gap-2 text-sm py-2.5">
            <Users className="w-4 h-4" />Mark All Present
          </button>
          <button onClick={saveAttendance} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Attendance
          </button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="glass-card p-16 text-center"><Users className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" /><p className="text-text-secondary">No approved employees found</p></div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {employees.map(emp => (
              <div key={emp.id} className="glass-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {emp.photo_url ? <img src={emp.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-primary">{emp.full_name.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{emp.full_name}</p>
                    <p className="text-xs text-text-secondary">{emp.designation}</p>
                  </div>
                  <span className="text-xs text-text-secondary font-mono flex-shrink-0">{emp.employee_id}</span>
                </div>
                <div className="bg-background rounded-lg p-2 border border-border">
                  <p className="text-xs text-text-secondary mb-1">Department</p>
                  <p className="text-sm text-text-primary font-medium">{emp.department}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {statuses.map(s => (
                    <button key={s} onClick={() => setStatus(emp.id, s)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all capitalize ${attendance[emp.id] === s ? statusColors[s] : 'bg-surface border-border text-text-secondary hover:border-primary/30'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Employee</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Department</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="table-row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {emp.photo_url ? <img src={emp.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-primary">{emp.full_name.charAt(0)}</span>}
                        </div>
                        <div><p className="text-sm font-medium text-text-primary">{emp.full_name}</p><p className="text-xs text-text-secondary">{emp.designation}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary font-mono">{emp.employee_id}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{emp.department}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {statuses.map(s => (
                          <button key={s} onClick={() => setStatus(emp.id, s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${attendance[emp.id] === s ? statusColors[s] : 'bg-surface border-border text-text-secondary hover:border-primary/30'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

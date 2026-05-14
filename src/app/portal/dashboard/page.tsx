'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Calendar, Clock, Briefcase, Download, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { generateIDCard } from '@/lib/idcard';
import toast from 'react-hot-toast';

export default function PortalDashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, total: 0 });
  const [daysInCompany, setDaysInCompany] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('portal_session');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSession(parsed);
      fetchAttendanceStats(parsed.id);
      if (parsed.join_date) {
        const join = new Date(parsed.join_date);
        const now = new Date();
        const diff = Math.floor((now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));
        setDaysInCompany(diff);
      }
    }
  }, []);

  const fetchAttendanceStats = async (empId: string) => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString();
    const year = now.getFullYear().toString();
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;

    const { data } = await supabase
      .from('attendance')
      .select('status')
      .eq('employee_id', empId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (data) {
      const present = data.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day').length;
      const absent = data.filter(a => a.status === 'absent').length;
      setAttendanceStats({ present, absent, total: data.length });
    }
  };

  const handleDownloadIDCard = async () => {
    if (!session) return;
    setDownloading(true);
    try {
      const doc = await generateIDCard({
        employeeId: session.employee_id,
        fullName: session.full_name,
        designation: session.designation,
        department: session.department,
        email: session.email,
        joinDate: session.join_date ? formatDate(session.join_date) : 'N/A',
        photoUrl: session.photo_url,
      });
      doc.save(`${session.employee_id}-IDCard.pdf`);
      toast.success('ID Card downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate ID card');
    } finally {
      setDownloading(false);
    }
  };

  if (!session) {
    return <div className="flex items-center justify-center h-96"><div className="spinner" /></div>;
  }

  const attendancePercentage = attendanceStats.total > 0
    ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-approved">Active</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Welcome back, {session.full_name?.split(' ')[0]}
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            {session.designation} — {session.department}
          </p>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Employee ID</p>
              <p className="text-xl font-heading font-bold text-text-primary mt-1 font-mono">{session.employee_id}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Join Date</p>
              <p className="text-xl font-heading font-bold text-text-primary mt-1">{session.join_date ? formatDate(session.join_date) : 'N/A'}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Days in Company</p>
              <p className="text-xl font-heading font-bold text-text-primary mt-1">{daysInCompany}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Department</p>
              <p className="text-xl font-heading font-bold text-text-primary mt-1">{session.department}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <div className="glass-card p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-6">
            Monthly Attendance Summary
          </h2>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1e2d4a" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - attendancePercentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-heading font-bold text-text-primary">{attendancePercentage}%</span>
                <span className="text-xs text-text-secondary">Attendance</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-background rounded-xl p-3 text-center border border-border">
              <p className="text-2xl font-heading font-bold text-success">{attendanceStats.present}</p>
              <p className="text-xs text-text-secondary mt-1">Present</p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center border border-border">
              <p className="text-2xl font-heading font-bold text-danger">{attendanceStats.absent}</p>
              <p className="text-xs text-text-secondary mt-1">Absent</p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center border border-border">
              <p className="text-2xl font-heading font-bold text-text-primary">{attendanceStats.total}</p>
              <p className="text-xs text-text-secondary mt-1">Total Days</p>
            </div>
          </div>
        </div>

        {/* ID Card Download */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Digital ID Card
          </h2>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            Download your official NexaHR employee identity card as a PDF. The card includes your photo, details, and a scannable QR code for verification.
          </p>

          {/* ID Card Preview */}
          <div className="flex-1 bg-background rounded-2xl border border-border p-6 mb-6 flex items-center justify-center">
            <div className="w-full max-w-xs bg-surface rounded-xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/5">
              <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-primary/20">
                    {session.photo_url ? (
                      <img src={session.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-primary">{session.full_name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-text-primary text-sm">{session.full_name}</p>
                    <p className="text-xs text-primary">{session.designation}</p>
                    <p className="text-[10px] text-text-secondary">{session.department}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-secondary border-t border-border pt-2">
                  <span className="font-mono">{session.employee_id}</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success" /> Verified</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadIDCard}
            disabled={downloading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {downloading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
            ) : (
              <><Download className="w-4 h-4" />Download ID Card (PDF)</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

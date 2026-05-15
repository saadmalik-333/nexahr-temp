'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, Clock, UserCheck, UserX, AlertCircle, Check, X, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Stats {
  total: number;
  pending: number;
  presentToday: number;
  terminated: number;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
  designation: string;
  department: string;
  status: string;
  photo_url: string;
  created_at: string;
  ai_validation_score: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, presentToday: 0, terminated: 0 });
  const [pendingEmployees, setPendingEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all employees
      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (employees) {
        const approved = employees.filter((e) => e.status === 'approved');
        const pending = employees.filter((e) => e.status === 'pending');
        const terminated = employees.filter((e) => e.status === 'terminated');

        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0];
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('date', today)
          .eq('status', 'present');

        setStats({
          total: approved.length,
          pending: pending.length,
          presentToday: attendance?.length || 0,
          terminated: terminated.length,
        });

        setPendingEmployees(pending.slice(0, 5));
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (empId: string) => {
    setActionLoading(empId);
    try {
      const res = await fetch('/api/employees/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Employee approved: ${data.employeeId}`);
        fetchDashboardData();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to approve employee');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (empId: string) => {
    setActionLoading(empId);
    try {
      const res = await fetch('/api/employees/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Employee declined');
        fetchDashboardData();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to decline employee');
    } finally {
      setActionLoading(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Employees',
      value: stats.total,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Pending Approvals',
      value: stats.pending,
      icon: AlertCircle,
      color: 'text-warning',
      bg: 'bg-warning/10',
      alert: stats.pending > 0,
    },
    {
      label: 'Present Today',
      value: stats.presentToday,
      icon: UserCheck,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Terminated',
      value: stats.terminated,
      icon: UserX,
      color: 'text-danger',
      bg: 'bg-danger/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Dashboard Overview</h1>
        <p className="text-text-secondary mt-1">
          Welcome back, {session?.user?.name || 'Manager'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card relative w-full animate-slide-up">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-text-secondary truncate">{card.label}</p>
                <p className="text-3xl font-heading font-bold text-text-primary mt-1 truncate">
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            {card.alert && (
              <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-warning animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Recent Pending Applications */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            Recent Pending Applications
          </h2>
          <button
            onClick={() => router.push('/admin/dashboard/employees')}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View All →
          </button>
        </div>

        {pendingEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
            <p className="text-text-secondary">No pending applications</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Department
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    AI Score
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingEmployees.map((emp) => (
                  <tr key={emp.id} className="table-row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {emp.photo_url ? (
                            <img
                              src={emp.photo_url}
                              alt={emp.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-primary">
                              {emp.full_name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{emp.full_name}</p>
                          <p className="text-xs text-text-secondary">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{emp.designation}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{emp.department}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-semibold ${
                          (emp.ai_validation_score || 0) >= 70
                            ? 'text-success'
                            : (emp.ai_validation_score || 0) >= 40
                            ? 'text-warning'
                            : 'text-danger'
                        }`}
                      >
                        {emp.ai_validation_score || '—'}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatDate(emp.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(emp.id)}
                          disabled={actionLoading === emp.id}
                          className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                          title="Approve"
                        >
                          {actionLoading === emp.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDecline(emp.id)}
                          disabled={actionLoading === emp.id}
                          className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                          title="Decline"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

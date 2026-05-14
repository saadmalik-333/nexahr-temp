'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, CreditCard, Mail, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export default function PortalLoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: employee, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('email', email)
        .single();

      if (fetchError || !employee) {
        setError('Invalid Employee ID or email address');
        setLoading(false);
        return;
      }

      if (employee.status === 'terminated') {
        setError('Your employment has been terminated. Please contact HR.');
        setLoading(false);
        return;
      }

      if (employee.status !== 'approved') {
        setError('Your account is not active. Please wait for approval.');
        setLoading(false);
        return;
      }

      // Store session in localStorage
      localStorage.setItem('portal_session', JSON.stringify({
        id: employee.id,
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        email: employee.email,
        designation: employee.designation,
        department: employee.department,
        photo_url: employee.photo_url,
        join_date: employee.join_date,
        status: employee.status,
      }));

      toast.success(`Welcome back, ${employee.full_name}!`);
      router.push('/portal/dashboard');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-bg flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-text-primary">Employee Portal</h1>
          <p className="text-text-secondary mt-2">Sign in with your Employee ID</p>
        </div>

        <div className="glass-card p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Employee ID</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input type="text" className="input-field pl-11" placeholder="NHR-2025-0001" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input type="email" className="input-field pl-11" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : 'Sign In to Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Search, Check, X, Ban, Eye, Loader2, Sparkles, X as XIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate, getRecommendationColor } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  experience_years: number;
  address: string;
  photo_url: string;
  status: string;
  ai_summary: string;
  ai_validation_score: number;
  join_date: string;
  created_at: string;
}

const statusTabs = ['All', 'Pending', 'Approved', 'Declined', 'Terminated'];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { filterEmployees(); }, [search, activeTab, employees]);

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    if (data) setEmployees(data);
    setLoading(false);
  };

  const filterEmployees = () => {
    let result = employees;
    if (activeTab !== 'All') result = result.filter(e => e.status === activeTab.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.full_name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) ||
        (e.employee_id && e.employee_id.toLowerCase().includes(q)) || e.department.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  };

  const handleAction = async (action: string, empId: string) => {
    setActionLoading(empId);
    try {
      let res;
      if (action === 'approve') {
        res = await fetch('/api/employees/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: empId }) });
      } else if (action === 'decline') {
        res = await fetch('/api/employees/decline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: empId }) });
      } else {
        res = await fetch(`/api/employees/${empId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'terminated' }) });
      }
      if (res.ok) {
        toast.success(action === 'approve' ? 'Employee approved!' : action === 'decline' ? 'Employee declined' : 'Employee terminated');
        fetchEmployees(); setSelectedEmployee(null);
      } else { const d = await res.json(); toast.error(d.error); }
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(null); }
  };

  const badge = (s: string) => {
    const c: Record<string,string> = { pending: 'badge-pending', approved: 'badge-approved', declined: 'badge-declined', terminated: 'badge-terminated' };
    return <span className={c[s] || 'badge'}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
  };

  const parseAI = (s: string) => { try { return JSON.parse(s); } catch { return null; } };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="spinner" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="section-title">Employees</h1><p className="text-text-secondary mt-1">Manage all employee applications and records</p></div>

      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input type="text" className="input-field pl-11 w-full" placeholder="Search by name, email, ID, or department..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {statusTabs.map(tab => {
          const count = tab === 'All' ? employees.length : employees.filter(e => e.status === tab.toLowerCase()).length;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'}`}>
              {tab}<span className="ml-2 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                {['Employee','Designation','Department','Status','AI Score','Date','Actions'].map(h => (
                  <th key={h} className={`${h === 'Actions' ? 'text-right' : 'text-left'} px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} className="table-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {emp.photo_url ? <img src={emp.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-primary">{emp.full_name.charAt(0)}</span>}
                      </div>
                      <div><p className="text-sm font-medium text-text-primary">{emp.full_name}</p><p className="text-xs text-text-secondary">{emp.email}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{emp.designation}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{emp.department}</td>
                  <td className="px-6 py-4">{badge(emp.status)}</td>
                  <td className="px-6 py-4"><span className={`text-sm font-semibold ${(emp.ai_validation_score||0) >= 70 ? 'text-success' : (emp.ai_validation_score||0) >= 40 ? 'text-warning' : 'text-danger'}`}>{emp.ai_validation_score || '—'}</span></td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{emp.join_date ? formatDate(emp.join_date) : formatDate(emp.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setSelectedEmployee(emp)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                      {emp.status === 'pending' && (<>
                        <button onClick={() => handleAction('approve', emp.id)} disabled={!!actionLoading} className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors" title="Approve">{actionLoading === emp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}</button>
                        <button onClick={() => handleAction('decline', emp.id)} disabled={!!actionLoading} className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors" title="Decline"><X className="w-4 h-4" /></button>
                      </>)}
                      {emp.status === 'approved' && <button onClick={() => handleAction('terminate', emp.id)} disabled={!!actionLoading} className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors" title="Terminate"><Ban className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-6 py-16 text-center text-text-secondary">No employees found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setSelectedEmployee(null); }}>
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-heading text-xl font-semibold text-text-primary">Employee Details</h2>
              <button onClick={() => setSelectedEmployee(null)} className="p-2 rounded-lg hover:bg-surface transition-colors text-text-secondary"><XIcon className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedEmployee.photo_url ? <img src={selectedEmployee.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-primary">{selectedEmployee.full_name.charAt(0)}</span>}
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-text-primary">{selectedEmployee.full_name}</h3>
                  <p className="text-primary">{selectedEmployee.designation}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {badge(selectedEmployee.status)}
                    {selectedEmployee.employee_id && <span className="text-xs text-text-secondary bg-surface px-2 py-1 rounded-lg border border-border">{selectedEmployee.employee_id}</span>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[{ l: 'Email', v: selectedEmployee.email }, { l: 'Phone', v: selectedEmployee.phone }, { l: 'Department', v: selectedEmployee.department }, { l: 'Experience', v: `${selectedEmployee.experience_years} years` }, { l: 'Join Date', v: selectedEmployee.join_date ? formatDate(selectedEmployee.join_date) : 'N/A' }, { l: 'Applied', v: formatDate(selectedEmployee.created_at) }].map(i => (
                  <div key={i.l} className="bg-background rounded-xl p-3 border border-border"><p className="text-xs text-text-secondary mb-1">{i.l}</p><p className="text-sm text-text-primary font-medium">{i.v}</p></div>
                ))}
              </div>
              {selectedEmployee.ai_summary && (() => {
                const ai = parseAI(selectedEmployee.ai_summary);
                if (!ai) return null;
                return (
                  <div className="bg-background rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-primary" /><h4 className="font-heading font-semibold text-text-primary">AI Analysis</h4></div>
                    <div className="space-y-3">
                      <div><div className="flex justify-between mb-2"><span className="text-sm text-text-secondary">Score</span><span className="font-bold text-text-primary">{ai.score}/100</span></div><div className="w-full h-2 bg-border rounded-full overflow-hidden"><div className={`h-full rounded-full ${ai.score >= 70 ? 'bg-success' : ai.score >= 40 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${ai.score}%` }} /></div></div>
                      <p className="text-sm text-text-secondary">{ai.summary}</p>
                      <div className="flex items-center gap-2"><span className="text-sm text-text-secondary">Recommendation:</span><span className={`text-sm font-semibold ${getRecommendationColor(ai.recommendation)}`}>{ai.recommendation?.charAt(0).toUpperCase() + ai.recommendation?.slice(1)}</span></div>
                      {ai.flags?.length > 0 && ai.flags.map((f: string, i: number) => <div key={i} className="px-3 py-2 bg-warning/10 border border-warning/20 rounded-lg text-sm text-warning">⚠️ {f}</div>)}
                    </div>
                  </div>
                );
              })()}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                {selectedEmployee.status === 'pending' && (<>
                  <button onClick={() => handleAction('decline', selectedEmployee.id)} disabled={!!actionLoading} className="btn-danger flex items-center gap-2 text-sm py-2.5"><X className="w-4 h-4" />Decline</button>
                  <button onClick={() => handleAction('approve', selectedEmployee.id)} disabled={!!actionLoading} className="btn-success flex items-center gap-2 text-sm py-2.5">{actionLoading === selectedEmployee.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Approve</button>
                </>)}
                {selectedEmployee.status === 'approved' && <button onClick={() => handleAction('terminate', selectedEmployee.id)} disabled={!!actionLoading} className="btn-danger flex items-center gap-2 text-sm py-2.5"><Ban className="w-4 h-4" />Terminate</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

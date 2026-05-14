'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, LayoutDashboard, CalendarCheck, CreditCard, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/dashboard/attendance', label: 'My Attendance', icon: CalendarCheck },
];

export default function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('portal_session');
    if (!stored) { router.push('/portal/login'); return; }
    setSession(JSON.parse(stored));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('portal_session');
    router.push('/portal/login');
  };

  if (!session) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="spinner" /></div>;

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-border">
          <Link href="/portal/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
            <div><span className="font-heading text-lg font-bold text-text-primary block">NexaHR</span><span className="text-[10px] text-text-secondary uppercase tracking-wider">Employee Portal</span></div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-text-secondary hover:text-text-primary"><X className="w-5 h-5" /></button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {session.photo_url ? <img src={session.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-primary">{session.full_name?.charAt(0)}</span>}
            </div>
            <div className="overflow-hidden"><p className="text-sm font-medium text-text-primary truncate">{session.full_name}</p><p className="text-xs text-text-secondary truncate">{session.employee_id}</p></div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={isActive ? 'sidebar-link-active' : 'sidebar-link'}><item.icon className="w-5 h-5" /><span className="font-medium">{item.label}</span></Link>;
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <button onClick={handleLogout} className="sidebar-link w-full text-danger hover:bg-danger/10 hover:text-danger"><LogOut className="w-5 h-5" /><span className="font-medium">Logout</span></button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen">
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-border bg-surface">
          <button onClick={() => setSidebarOpen(true)} className="text-text-primary p-2 hover:bg-background rounded-xl"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div><span className="font-heading text-lg font-bold text-text-primary">NexaHR</span></div>
          <div className="w-9" />
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

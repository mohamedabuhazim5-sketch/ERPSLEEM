import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { getCurrentProfile, signOut } from '../../lib/auth';

const routeTitles = {
  '/dashboard': 'لوحة التحكم',
  '/admin/control-center': 'مركز التحكم',
  '/sales': 'المبيعات',
  '/sales/history': 'سجل المبيعات',
  '/products': 'الأصناف',
  '/purchases': 'الوارد',
  '/purchases/history': 'سجل المشتريات',
  '/customers': 'العملاء',
  '/suppliers': 'الموردين',
  '/expenses': 'المصروفات',
  '/reports': 'التقارير',
  '/finance/receipt': 'سند قبض',
  '/finance/payment-voucher': 'سند دفع',
  '/audit-log': 'سجل العمليات',
  '/users': 'إدارة المستخدمين',
  '/settings': 'الإعدادات',
};

export default function AppShell() {
  const location = useLocation();
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: getCurrentProfile,
  });

  const navItems = useMemo(
    () => [
      { to: '/dashboard', label: 'لوحة التحكم', roles: ['admin', 'cashier', 'storekeeper', 'accountant'] },
      { to: '/admin/control-center', label: 'مركز التحكم', roles: ['admin'] },
      { to: '/sales', label: 'المبيعات', roles: ['admin', 'cashier'] },
      { to: '/sales/history', label: 'سجل المبيعات', roles: ['admin', 'cashier', 'accountant'] },
      { to: '/products', label: 'الأصناف', roles: ['admin', 'storekeeper'] },
      { to: '/purchases', label: 'الوارد', roles: ['admin', 'storekeeper'] },
      { to: '/purchases/history', label: 'سجل المشتريات', roles: ['admin', 'storekeeper', 'accountant'] },
      { to: '/customers', label: 'العملاء', roles: ['admin', 'cashier', 'accountant'] },
      { to: '/suppliers', label: 'الموردين', roles: ['admin', 'storekeeper', 'accountant'] },
      { to: '/expenses', label: 'المصروفات', roles: ['admin', 'accountant'] },
      { to: '/reports', label: 'التقارير', roles: ['admin', 'accountant'] },
      { to: '/finance/receipt', label: 'سند قبض', roles: ['admin', 'accountant'] },
      { to: '/finance/payment-voucher', label: 'سند دفع', roles: ['admin', 'accountant'] },
      { to: '/audit-log', label: 'سجل العمليات', roles: ['admin'] },
      { to: '/users', label: 'إدارة المستخدمين', roles: ['admin'] },
      { to: '/settings', label: 'الإعدادات', roles: ['admin'] },
    ],
    []
  );

  const filteredItems = navItems.filter((item) => {
    if (!profile) return false;
    return item.roles.includes(profile.role);
  });

  const pageTitle = routeTitles[location.pathname] || 'Sleem ERP';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc,#eef2ff_45%,#f8fafc)]" dir="rtl">
      <div className="flex min-h-screen">
        <aside className="w-80 space-y-6 border-l border-white/60 bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-slate-900/10">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-2xl font-black tracking-tight">Sleem ERP</h2>
            <p className="mt-2 text-sm text-slate-300">{loadingProfile ? 'جاري تحميل المستخدم...' : profile?.full_name || 'مستخدم'}</p>
            <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">{profile?.role || ''}</div>
          </div>
          <nav className="space-y-2">{filteredItems.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `block rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}>{item.label}</NavLink>)}</nav>
          <button onClick={async () => { await signOut(); window.location.href = '/login'; }} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-slate-100 transition hover:bg-white/10">تسجيل الخروج</button>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">ERP Workspace</p><h1 className="mt-1 text-2xl font-black text-slate-900">{pageTitle}</h1></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">{loadingProfile ? '...' : `مرحبًا، ${profile?.full_name || 'مستخدم'}`}</div>
            </div>
          </header>
          <main className="flex-1 p-6"><Outlet context={{ profile }} /></main>
        </div>
      </div>
    </div>
  );
}

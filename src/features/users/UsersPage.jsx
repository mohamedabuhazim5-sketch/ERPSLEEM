import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { queryKeys } from '../../lib/queryKeys';
import { getUsers, updateUserRole } from './users.service';

const roles = ['admin', 'cashier', 'storekeeper', 'accountant'];

export default function UsersPage({ embedded = false }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const { data: rows = [], isLoading: loading } = useQuery({ queryKey: queryKeys.users, queryFn: getUsers });
  const updateMutation = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users }),
    onError: (err) => setError(err.message || 'تعذر تحديث صلاحية المستخدم'),
  });

  const stats = useMemo(() => ({
    total: rows.length,
    admins: rows.filter((row) => row.role === 'admin').length,
    active: rows.filter((row) => row.is_active).length,
    accountants: rows.filter((row) => row.role === 'accountant').length,
  }), [rows]);

  return (
    <div className="space-y-6" dir="rtl">
      {!embedded ? <PageHeader title="إدارة المستخدمين" subtitle="إدارة الأدوار والصلاحيات الأساسية" /> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard title="إجمالي المستخدمين" value={stats.total} /><StatCard title="عدد الـ Admin" value={stats.admins} /><StatCard title="الحسابات النشطة" value={stats.active} /><StatCard title="المحاسبون" value={stats.accountants} /></div>
      <SectionCard title="المستخدمون" subtitle="يمكن تغيير الدور مباشرة من الجدول">{loading ? <div className="p-2 text-slate-500">جاري التحميل...</div> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50/80 text-slate-600"><tr><th className="p-4 text-right">الاسم</th><th className="p-4 text-right">البريد</th><th className="p-4 text-right">الدور</th><th className="p-4 text-right">الحالة</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-slate-100"><td className="p-4 font-semibold text-slate-900">{row.full_name}</td><td className="p-4 text-slate-600">{row.email || '-'}</td><td className="p-4"><select value={row.role} onChange={(e) => updateMutation.mutate({ id: row.id, role: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></td><td className="p-4"><StatusBadge value={row.is_active ? 'active' : 'inactive'} label={row.is_active ? 'نشط' : 'موقوف'} /></td></tr>)}{rows.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-slate-500">لا يوجد مستخدمون بعد</td></tr> : null}</tbody></table></div>}</SectionCard>
    </div>
  );
}

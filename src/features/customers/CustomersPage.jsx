import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import TableSearchBar from '../../components/ui/TableSearchBar';
import SectionCard from '../../components/ui/SectionCard';
import ActionButton from '../../components/ui/ActionButton';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency } from '../../lib/format';
import { queryKeys } from '../../lib/queryKeys';
import CustomerForm from './CustomerForm';
import { createCustomer, deactivateCustomer, getCustomers, updateCustomer } from './customers.service';

export default function CustomersPage({ embedded = false }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  const { data: rows = [], isLoading: loading } = useQuery({ queryKey: queryKeys.customers, queryFn: getCustomers });

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.customers }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardCounts }),
      queryClient.invalidateQueries({ queryKey: queryKeys.reportsSummary }),
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOptions }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => { setShowForm(false); setEditingRow(null); setError(''); await invalidateAll(); },
    onError: (err) => setError(err.message || 'تعذر حفظ العميل'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => updateCustomer(id, values),
    onSuccess: async () => { setShowForm(false); setEditingRow(null); setError(''); await invalidateAll(); },
    onError: (err) => setError(err.message || 'تعذر تعديل العميل'),
  });
  const deactivateMutation = useMutation({
    mutationFn: deactivateCustomer,
    onSuccess: invalidateAll,
    onError: (err) => setError(err.message || 'تعذر إيقاف العميل'),
  });

  function handleSubmit(values) {
    if (editingRow) updateMutation.mutate({ id: editingRow.id, values });
    else createMutation.mutate(values);
  }

  const filteredRows = useMemo(
    () => rows.filter((row) => {
      const matchesSearch = row.name?.toLowerCase().includes(search.toLowerCase()) || row.phone?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === '' ? true : statusFilter === 'active' ? row.is_active : !row.is_active;
      return matchesSearch && matchesStatus;
    }),
    [rows, search, statusFilter]
  );

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.is_active).length,
      debtors: rows.filter((r) => Number(r.balance || 0) > 0).length,
      receivables: rows.reduce((sum, r) => sum + Number(r.balance || 0), 0),
    }),
    [rows]
  );

  const saving = createMutation.isPending || updateMutation.isPending;


  const embeddedActions = embedded ? (
    <div className="flex justify-end">
      <ActionButton onClick={() => { setEditingRow(null); setShowForm((v) => !v); }} variant={showForm ? 'secondary' : 'primary'}>
        {showForm ? 'إغلاق النموذج' : 'إضافة عميل جديد'}
      </ActionButton>
    </div>
  ) : null;

  return (
    <div className="space-y-6" dir="rtl">
      {!embedded ? <PageHeader title="العملاء" subtitle="إدارة بيانات العملاء والأرصدة وكشوف الحساب" actions={<ActionButton onClick={() => { setEditingRow(null); setShowForm((v) => !v); }} variant={showForm ? 'secondary' : 'primary'}>{showForm ? 'إغلاق النموذج' : 'إضافة عميل جديد'}</ActionButton>} /> : null}

      {embeddedActions}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجمالي العملاء" value={stats.total} />
        <StatCard title="العملاء النشطون" value={stats.active} />
        <StatCard title="العملاء المديونون" value={stats.debtors} />
        <StatCard title="إجمالي المستحقات" value={formatCurrency(stats.receivables)} />
      </div>

      <TableSearchBar search={search} onSearchChange={setSearch} filterValue={statusFilter} onFilterChange={setStatusFilter} placeholder="ابحث باسم العميل أو الهاتف" filterOptions={[{ value: 'active', label: 'نشط' }, { value: 'inactive', label: 'موقوف' }]} />

      {showForm ? <SectionCard title={editingRow ? 'تعديل عميل' : 'إضافة عميل'} subtitle="أدخل البيانات الأساسية للعميل"><CustomerForm onSubmit={handleSubmit} loading={saving} initialData={editingRow} /></SectionCard> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

      <SectionCard title="قائمة العملاء" subtitle="آخر العملاء مع حالة النشاط والرصيد">
        {loading ? <div className="text-slate-500">جاري تحميل العملاء...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 text-slate-600"><tr><th className="p-4 text-right">الاسم</th><th className="p-4 text-right">الهاتف</th><th className="p-4 text-right">العنوان</th><th className="p-4 text-right">الرصيد</th><th className="p-4 text-right">الحالة</th><th className="p-4 text-right">العمليات</th></tr></thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="p-4 font-semibold text-slate-900">{row.name}</td>
                    <td className="p-4 text-slate-600">{row.phone || '-'}</td>
                    <td className="p-4 text-slate-600">{row.address || '-'}</td>
                    <td className="p-4 font-semibold text-amber-600">{formatCurrency(row.balance)}</td>
                    <td className="p-4"><StatusBadge value={row.is_active ? 'active' : 'inactive'} label={row.is_active ? 'نشط' : 'موقوف'} /></td>
                    <td className="p-4"><div className="flex gap-3"><ActionButton variant="secondary" onClick={() => { setEditingRow(row); setShowForm(true); }} className="px-3 py-2 text-blue-700">تعديل</ActionButton><Link to={`/customers/${row.id}/statement`} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">كشف حساب</Link><ActionButton variant="danger" onClick={() => deactivateMutation.mutate(row.id)} className="px-3 py-2">إيقاف</ActionButton></div></td>
                  </tr>
                ))}
                {filteredRows.length === 0 ? <tr><td colSpan="6" className="p-6"><EmptyState title="لا يوجد عملاء مطابقون" description="جرّب تعديل البحث أو الفلاتر الحالية." /></td></tr> : null}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

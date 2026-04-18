import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import TableSearchBar from '../../components/ui/TableSearchBar';
import SectionCard from '../../components/ui/SectionCard';
import ActionButton from '../../components/ui/ActionButton';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from '../../components/ui/StatCard';
import { formatCurrency, formatDate } from '../../lib/format';
import { queryKeys } from '../../lib/queryKeys';
import ExpenseForm from './ExpenseForm';
import { createExpense, getExpenses, updateExpense } from './expenses.service';

export default function ExpensesPage({ embedded = false }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const { data: rows = [], isLoading: loading } = useQuery({ queryKey: queryKeys.expenses, queryFn: getExpenses });

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardCounts }),
      queryClient.invalidateQueries({ queryKey: queryKeys.reportsSummary }),
    ]);
  };

  const createMutation = useMutation({ mutationFn: createExpense, onSuccess: async () => { setShowForm(false); setEditingRow(null); setError(''); await invalidateAll(); }, onError: (err) => setError(err.message || 'تعذر حفظ المصروف') });
  const updateMutation = useMutation({ mutationFn: ({ id, values }) => updateExpense(id, values), onSuccess: async () => { setShowForm(false); setEditingRow(null); setError(''); await invalidateAll(); }, onError: (err) => setError(err.message || 'تعذر تعديل المصروف') });

  function handleSubmit(values) {
    if (editingRow) updateMutation.mutate({ id: editingRow.id, values });
    else createMutation.mutate(values);
  }

  const filteredRows = useMemo(() => rows.filter((row) => row.title?.toLowerCase().includes(search.toLowerCase()) || row.category?.toLowerCase().includes(search.toLowerCase())), [rows, search]);
  const totalExpenses = useMemo(() => filteredRows.reduce((sum, row) => sum + Number(row.amount || 0), 0), [filteredRows]);
  const categoriesCount = new Set(rows.map((row) => row.category).filter(Boolean)).size;
  const saving = createMutation.isPending || updateMutation.isPending;


  const embeddedActions = embedded ? (
    <div className="flex justify-end">
      <ActionButton onClick={() => { setEditingRow(null); setShowForm((v) => !v); }} variant={showForm ? 'secondary' : 'primary'}>
        {showForm ? 'إغلاق النموذج' : 'إضافة مصروف'}
      </ActionButton>
    </div>
  ) : null;

  return (
    <div className="space-y-6" dir="rtl">
      {!embedded ? <PageHeader title="المصروفات" subtitle={`إجمالي المصروفات الحالية: ${formatCurrency(totalExpenses)}`} actions={<ActionButton onClick={() => { setEditingRow(null); setShowForm((v) => !v); }} variant={showForm ? 'secondary' : 'primary'}>{showForm ? 'إغلاق النموذج' : 'إضافة مصروف'}</ActionButton>} /> : null}

      {embeddedActions}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجمالي البنود" value={rows.length} />
        <StatCard title="الفئات" value={categoriesCount} />
        <StatCard title="المصروفات المعروضة" value={filteredRows.length} />
        <StatCard title="إجمالي القيمة" value={formatCurrency(totalExpenses)} />
      </div>

      <TableSearchBar search={search} onSearchChange={setSearch} placeholder="ابحث باسم المصروف أو الفئة" />

      {showForm ? <SectionCard title={editingRow ? 'تعديل مصروف' : 'إضافة مصروف'} subtitle="أدخل بيانات بند المصروف"><ExpenseForm onSubmit={handleSubmit} loading={saving} initialData={editingRow} /></SectionCard> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

      <SectionCard title="قائمة المصروفات" subtitle="آخر البنود المصروفة والتصنيفات المرتبطة بها">
        {loading ? <div className="text-slate-500">جاري تحميل المصروفات...</div> : (
          <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50/80 text-slate-600"><tr><th className="p-4 text-right">الاسم</th><th className="p-4 text-right">الفئة</th><th className="p-4 text-right">القيمة</th><th className="p-4 text-right">التاريخ</th><th className="p-4 text-right">ملاحظات</th><th className="p-4 text-right">العمليات</th></tr></thead><tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100"><td className="p-4 font-medium">{row.title}</td><td className="p-4">{row.category}</td><td className="p-4">{formatCurrency(row.amount)}</td><td className="p-4">{formatDate(row.expense_date)}</td><td className="p-4">{row.notes || '-'}</td><td className="p-4"><ActionButton variant="secondary" onClick={() => { setEditingRow({ ...row, expense_date: new Date(row.expense_date).toISOString().slice(0, 10) }); setShowForm(true); }} className="px-3 py-2 text-blue-700">تعديل</ActionButton></td></tr>
            ))}
            {filteredRows.length === 0 ? <tr><td colSpan="6" className="p-6"><EmptyState title="لا توجد مصروفات مطابقة" description="جرّب تعديل كلمة البحث أو أضف بندًا جديدًا." /></td></tr> : null}
          </tbody></table></div>
        )}
      </SectionCard>
    </div>
  );
}

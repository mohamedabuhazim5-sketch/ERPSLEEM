import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import TableSearchBar from '../../components/ui/TableSearchBar';
import SectionCard from '../../components/ui/SectionCard';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDateTime } from '../../lib/format';
import { queryKeys } from '../../lib/queryKeys';
import { getPurchasesHistory } from './purchases.service';

export default function PurchasesHistoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const { data: rows = [], isLoading: loading } = useQuery({ queryKey: queryKeys.purchasesHistory, queryFn: getPurchasesHistory });

  const filteredRows = useMemo(() => rows.filter((row) => {
    const supplierName = row.suppliers?.name || '-';
    const matchesSearch = row.invoice_number?.toLowerCase().includes(search.toLowerCase()) || supplierName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' ? true : row.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [rows, search, statusFilter]);

  const stats = useMemo(() => ({
    total: rows.length,
    paid: rows.filter((row) => row.status === 'paid').length,
    partial: rows.filter((row) => row.status === 'partial').length,
    totalAmount: rows.reduce((sum, row) => sum + Number(row.total_amount || 0), 0),
  }), [rows]);

  return <div className="space-y-6" dir="rtl"><PageHeader title="سجل المشتريات" subtitle="جميع فواتير الوارد المسجلة" />{error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard title="إجمالي الفواتير" value={stats.total} /><StatCard title="مدفوعة بالكامل" value={stats.paid} /><StatCard title="جزئية" value={stats.partial} /><StatCard title="إجمالي المشتريات" value={formatCurrency(stats.totalAmount)} /></div><SectionCard title="فلترة السجل" subtitle="ابحث برقم الفاتورة أو المورد أو اختر الحالة المطلوبة"><TableSearchBar search={search} onSearchChange={setSearch} filterValue={statusFilter} onFilterChange={setStatusFilter} placeholder="ابحث برقم الفاتورة أو المورد" filterOptions={[{ value: 'paid', label: 'مدفوعة' }, { value: 'partial', label: 'جزئية' }, { value: 'unpaid', label: 'غير مدفوعة' }, { value: 'cancelled', label: 'ملغاة' }]} /></SectionCard><SectionCard title="فواتير الشراء" subtitle="عرض سريع لحالة كل فاتورة ومبالغها"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-4 text-right">رقم الفاتورة</th><th className="p-4 text-right">المورد</th><th className="p-4 text-right">التاريخ</th><th className="p-4 text-right">الإجمالي</th><th className="p-4 text-right">المدفوع</th><th className="p-4 text-right">المتبقي</th><th className="p-4 text-right">الحالة</th></tr></thead><tbody>{loading ? <tr><td colSpan="7" className="p-6 text-slate-500">جاري التحميل...</td></tr> : filteredRows.map((row) => <tr key={row.id} className="border-t border-slate-100"><td className="p-4 font-medium">{row.invoice_number}</td><td className="p-4">{row.suppliers?.name || '-'}</td><td className="p-4">{formatDateTime(row.purchase_date)}</td><td className="p-4">{formatCurrency(row.total_amount)}</td><td className="p-4">{formatCurrency(row.paid_amount)}</td><td className="p-4">{formatCurrency(row.due_amount)}</td><td className="p-4"><StatusBadge value={row.status} label={row.status} /></td></tr>)}</tbody></table></div>{filteredRows.length === 0 && !loading ? <div className="pt-6"><EmptyState title="لا توجد فواتير مطابقة" description="جرّب تعديل البحث أو الفلترة الحالية." /></div> : null}</SectionCard></div>;
}

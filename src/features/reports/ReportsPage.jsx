import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import StatCard from '../../components/ui/StatCard';
import { formatCurrency } from '../../lib/format';
import { queryKeys } from '../../lib/queryKeys';
import { getReportSummary } from './reports.service';

export default function ReportsPage() {
  const { data, isLoading: loading, error } = useQuery({ queryKey: queryKeys.reportsSummary, queryFn: getReportSummary });

  if (loading) {
    return <div dir="rtl" className="rounded-[26px] border border-white/70 bg-white/80 p-6 shadow-sm">جاري تحميل التقارير...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="التقارير" subtitle="نظرة شاملة على الأداء المالي والتشغيلي" />
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error.message || 'تعذر تحميل التقارير'}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجمالي المبيعات" value={formatCurrency(data?.totalSales || 0)} />
        <StatCard title="إجمالي المشتريات" value={formatCurrency(data?.totalPurchases || 0)} />
        <StatCard title="إجمالي المصروفات" value={formatCurrency(data?.totalExpenses || 0)} />
        <StatCard title="صافي الربح" value={formatCurrency(data?.netProfit || 0)} />
        <StatCard title="هامش الربح" value={`${Number(data?.profitMargin || 0).toFixed(2)}%`} />
        <StatCard title="عدد فواتير البيع" value={data?.salesCount || 0} />
        <StatCard title="عدد فواتير الشراء" value={data?.purchasesCount || 0} />
        <StatCard title="قيمة المخزون" value={formatCurrency(data?.inventoryValue || 0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="المنتجات منخفضة المخزون" subtitle="راقب الأصناف التي تقترب من النفاد">
          <div className="space-y-3">
            {(data?.lowStock || []).length === 0 ? (
              <p className="text-slate-500">لا توجد منتجات منخفضة المخزون حاليًا.</p>
            ) : (
              data.lowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <span className="font-medium text-slate-900">{item.name}</span>
                  <strong className="text-rose-600">{item.stock_qty}</strong>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="العملاء المديونون" subtitle="أهم العملاء الذين لديهم رصيد مستحق">
          <div className="space-y-3">
            {(data?.debtCustomers || []).length === 0 ? (
              <p className="text-slate-500">لا توجد مديونيات على العملاء حاليًا.</p>
            ) : (
              data.debtCustomers.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <span className="font-medium text-slate-900">{item.name}</span>
                  <strong className="text-amber-600">{formatCurrency(item.balance)}</strong>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

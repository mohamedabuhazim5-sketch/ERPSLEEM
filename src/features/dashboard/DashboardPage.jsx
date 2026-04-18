import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { formatCurrency } from '../../lib/format';
import { queryKeys } from '../../lib/queryKeys';
import { getDashboardCharts, getDashboardCounts, getRecentSales } from './dashboard.service';
import SalesChart from './SalesChart';
import ProfitChart from './ProfitChart';
import NotificationsPanel from '../notifications/NotificationsPanel';

export default function DashboardPage() {
  const { profile } = useOutletContext();
  const { data: counts, isLoading: countsLoading } = useQuery({ queryKey: queryKeys.dashboardCounts, queryFn: getDashboardCounts });
  const { data: charts = { salesDaily: [], profitMonthly: [] } } = useQuery({ queryKey: queryKeys.dashboardCharts, queryFn: getDashboardCharts });
  const { data: recentSales = [] } = useQuery({ queryKey: queryKeys.dashboardRecentSales, queryFn: getRecentSales });

  const loading = countsLoading;
  const statCards = [
    { title: 'مبيعات اليوم', value: formatCurrency(counts?.salesTodayTotal || 0) },
    { title: 'مبيعات الشهر', value: formatCurrency(counts?.salesMonthTotal || 0) },
    { title: 'الوارد هذا الشهر', value: formatCurrency(counts?.purchasesMonthTotal || 0) },
    { title: 'المصروفات', value: formatCurrency(counts?.expensesMonthTotal || 0) },
    { title: 'صافي الربح', value: formatCurrency(counts?.netProfit || 0) },
    { title: 'هامش الربح', value: `${Number(counts?.profitMargin || 0).toFixed(2)}%` },
    { title: 'عدد العملاء', value: counts?.customersCount || 0 },
    { title: 'عدد الفواتير', value: counts?.invoicesCount || 0 },
    { title: 'عدد الموردين', value: counts?.suppliersCount || 0 },
    { title: 'نواقص المخزون', value: counts?.lowStockCount || 0 },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="لوحة التحكم" subtitle="ملخص لحظي لحالة النظام" />
      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6">جاري تحميل البيانات...</div> : <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{statCards.map((card) => <StatCard key={card.title} title={card.title} value={card.value} />)}</div>
        <div className="grid gap-4 lg:grid-cols-2"><SalesChart data={charts.salesDaily} /><ProfitChart data={charts.profitMonthly} /></div>
        <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-bold">آخر الفواتير</h2><div className="space-y-3">{recentSales.map((row) => <div key={row.id} className="rounded-xl border border-slate-100 p-3"><div className="flex items-center justify-between gap-4"><div><strong>{row.invoice_number}</strong><p className="mt-1 text-sm text-slate-600">{row.customers?.name || 'عميل نقدي'}</p></div><div className="text-left"><div className="font-semibold">{formatCurrency(row.total_amount)}</div><div className="text-xs text-slate-500">{row.status}</div></div></div></div>)}{recentSales.length === 0 ? <p className="text-slate-500">لا توجد فواتير حديثة.</p> : null}</div></div><NotificationsPanel role={profile?.role} /></div>
      </>}
    </div>
  );
}

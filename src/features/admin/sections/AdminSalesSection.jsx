
import { useEffect, useMemo, useState } from 'react';
import AdminMiniStat from '../components/AdminMiniStat';
import SalesPage from '../../sales/SalesPage';
import { getSalesHistory } from '../../sales/sales.service';
import { formatCurrency } from '../../../lib/format';

export default function AdminSalesSection() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getSalesHistory().then(setRows).catch(console.error);
  }, []);

  const stats = useMemo(() => {
    const total = rows.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);
    const due = rows.reduce((sum, row) => sum + Number(row.due_amount || 0), 0);
    const paid = rows.filter((row) => row.status === 'paid').length;
    return { total, due, paid };
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminMiniStat label="إجمالي الفواتير" value={rows.length} hint="فواتير بيع محفوظة" />
        <AdminMiniStat label="إجمالي المبيعات" value={formatCurrency(stats.total)} hint={`${stats.paid} فاتورة مدفوعة`} />
        <AdminMiniStat label="المبالغ المتبقية" value={formatCurrency(stats.due)} hint="مديونيات العملاء الحالية" />
      </div>
      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm">
        <SalesPage embedded />
      </div>
    </div>
  );
}

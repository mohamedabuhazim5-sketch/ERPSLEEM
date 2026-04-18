
import { useEffect, useMemo, useState } from 'react';
import AdminMiniStat from '../components/AdminMiniStat';
import PurchasesPage from '../../purchases/PurchasesPage';
import { getPurchasesHistory } from '../../purchases/purchases.service';
import { formatCurrency } from '../../../lib/format';

export default function AdminPurchasesSection() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getPurchasesHistory().then(setRows).catch(console.error);
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
        <AdminMiniStat label="إجمالي فواتير الشراء" value={rows.length} hint="فواتير وارد محفوظة" />
        <AdminMiniStat label="إجمالي المشتريات" value={formatCurrency(stats.total)} hint={`${stats.paid} فاتورة مسددة`} />
        <AdminMiniStat label="المبالغ المستحقة" value={formatCurrency(stats.due)} hint="التزامات الموردين الحالية" />
      </div>
      <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm">
        <PurchasesPage embedded />
      </div>
    </div>
  );
}

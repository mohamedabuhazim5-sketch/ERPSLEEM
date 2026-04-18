import { supabase } from '../../lib/supabase';

export async function getDashboardCounts() {
  const [salesRes, purchasesRes, expensesRes, customersRes, suppliersRes, lowStockRes] = await Promise.all([
    supabase.from('sales').select('total_amount,total_profit,sale_date'),
    supabase.from('purchases').select('total_amount,purchase_date'),
    supabase.from('expenses').select('amount,expense_date'),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('suppliers').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_qty', 5),
  ]);

  if (salesRes.error) throw salesRes.error;
  if (purchasesRes.error) throw purchasesRes.error;
  if (expensesRes.error) throw expensesRes.error;
  if (customersRes.error) throw customersRes.error;
  if (suppliersRes.error) throw suppliersRes.error;
  if (lowStockRes.error) throw lowStockRes.error;

  const today = new Date().toLocaleDateString('en-CA');
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const salesRows = salesRes.data || [];
  const purchasesRows = purchasesRes.data || [];
  const expenseRows = expensesRes.data || [];

  const salesTodayTotal = salesRows
    .filter((row) => new Date(row.sale_date).toLocaleDateString('en-CA') === today)
    .reduce((sum, row) => sum + Number(row.total_amount || 0), 0);

  const salesMonthTotal = salesRows
    .filter((row) => new Date(row.sale_date).toLocaleDateString('en-CA').slice(0, 7) === currentMonth)
    .reduce((sum, row) => sum + Number(row.total_amount || 0), 0);

  const purchasesMonthTotal = purchasesRows
    .filter((row) => new Date(row.purchase_date).toLocaleDateString('en-CA').slice(0, 7) === currentMonth)
    .reduce((sum, row) => sum + Number(row.total_amount || 0), 0);

  const expensesMonthTotal = expenseRows
    .filter((row) => new Date(row.expense_date).toLocaleDateString('en-CA').slice(0, 7) === currentMonth)
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const totalProfit = salesRows.reduce((sum, row) => sum + Number(row.total_profit || 0), 0);
  const netProfit = totalProfit - expensesMonthTotal;
  const profitMargin = salesMonthTotal > 0 ? (netProfit / salesMonthTotal) * 100 : 0;

  return {
    salesTodayTotal,
    salesMonthTotal,
    purchasesMonthTotal,
    expensesMonthTotal,
    totalProfit,
    netProfit,
    profitMargin,
    customersCount: customersRes.count || 0,
    suppliersCount: suppliersRes.count || 0,
    lowStockCount: lowStockRes.count || 0,
    invoicesCount: salesRows.length,
  };
}

export async function getDashboardCharts() {
  const { data, error } = await supabase
    .from('sales')
    .select('sale_date,total_amount,total_profit')
    .order('sale_date', { ascending: true });

  if (error) throw error;

  const dailyMap = new Map();
  const monthlyMap = new Map();

  (data || []).forEach((row) => {
    const date = new Date(row.sale_date);
    const dayKey = date.toLocaleDateString('en-CA');
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + Number(row.total_amount || 0));
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + Number(row.total_profit || 0));
  });

  return {
    salesDaily: Array.from(dailyMap.entries()).slice(-7).map(([label, sales]) => ({ label, sales })),
    profitMonthly: Array.from(monthlyMap.entries()).slice(-6).map(([label, profit]) => ({ label, profit })),
  };
}

export async function getRecentSales() {
  const { data, error } = await supabase
    .from('sales')
    .select('id,invoice_number,total_amount,status,sale_date,customers(name)')
    .order('sale_date', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data || [];
}

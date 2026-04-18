import { supabase } from '../../lib/supabase';

export async function getReportSummary() {
  const [salesRes, purchasesRes, expensesRes, productsRes, customersRes] = await Promise.all([
    supabase.from('sales').select('total_amount,total_profit,status'),
    supabase.from('purchases').select('total_amount,status'),
    supabase.from('expenses').select('amount'),
    supabase.from('products').select('id,name,stock_qty,sale_price,purchase_price'),
    supabase.from('customers').select('id,name,balance'),
  ]);

  if (salesRes.error) throw salesRes.error;
  if (purchasesRes.error) throw purchasesRes.error;
  if (expensesRes.error) throw expensesRes.error;
  if (productsRes.error) throw productsRes.error;
  if (customersRes.error) throw customersRes.error;

  const sales = salesRes.data || [];
  const purchases = purchasesRes.data || [];
  const expenses = expensesRes.data || [];
  const products = productsRes.data || [];
  const customers = customersRes.data || [];

  const totalSales = sales.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);
  const totalProfit = sales.reduce((sum, row) => sum + Number(row.total_profit || 0), 0);
  const totalPurchases = purchases.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const netProfit = totalProfit - totalExpenses;
  const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

  const lowStock = products.filter((p) => Number(p.stock_qty || 0) <= 5);
  const debtCustomers = customers.filter((c) => Number(c.balance || 0) > 0);
  const inventoryValue = products.reduce((sum, p) => sum + Number(p.stock_qty || 0) * Number(p.purchase_price || 0), 0);

  return {
    totalSales,
    totalProfit,
    totalPurchases,
    totalExpenses,
    netProfit,
    profitMargin,
    lowStock,
    debtCustomers,
    inventoryValue,
    salesCount: sales.length,
    purchasesCount: purchases.length,
  };
}

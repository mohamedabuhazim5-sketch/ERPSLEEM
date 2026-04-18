import { supabase } from '../../lib/supabase';

export async function getCustomerStatement(customerId) {
  const [customerRes, salesRes, receiptsRes] = await Promise.all([
    supabase.from('customers').select('id,name,phone,address,balance').eq('id', customerId).single(),
    supabase
      .from('sales')
      .select('id,invoice_number,total_amount,paid_amount,due_amount,sale_date,status')
      .eq('customer_id', customerId)
      .order('sale_date', { ascending: false }),
    supabase
      .from('receipts')
      .select('id,receipt_number,amount,payment_method,receipt_date,notes')
      .eq('customer_id', customerId)
      .order('receipt_date', { ascending: false }),
  ]);

  if (customerRes.error) throw customerRes.error;
  if (salesRes.error) throw salesRes.error;
  if (receiptsRes.error) throw receiptsRes.error;

  return {
    customer: customerRes.data,
    sales: salesRes.data || [],
    receipts: receiptsRes.data || [],
  };
}

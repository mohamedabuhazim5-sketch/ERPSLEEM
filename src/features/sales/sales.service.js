import { supabase } from '../../lib/supabase';

export async function getProductsForSale() {
  const { data, error } = await supabase
    .from('products')
    .select('id,name,stock_qty,sale_price,purchase_price')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getCustomerOptions() {
  const { data, error } = await supabase
    .from('customers')
    .select('id,name,balance')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createSaleInvoice(payload) {
  const { data, error } = await supabase.rpc('create_sale_invoice', {
    p_customer_id: payload.customer_id || null,
    p_payment_method: payload.payment_method,
    p_paid_amount: payload.paid_amount,
    p_discount: payload.discount,
    p_tax: payload.tax,
    p_notes: payload.notes || '',
    p_items: payload.items,
  });

  if (error) throw error;
  return data;
}

export async function getSalesHistory() {
  const { data, error } = await supabase
    .from('sales')
    .select('id,invoice_number,total_amount,paid_amount,due_amount,status,payment_method,sale_date,total_profit,customers(name)')
    .order('sale_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

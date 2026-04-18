import { supabase } from '../../lib/supabase';

export async function getProductsForPurchase() {
  const { data, error } = await supabase.from('products').select('id,name,stock_qty,purchase_price').order('name');
  if (error) throw error;
  return data || [];
}

export async function getSupplierOptions() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id,name,balance')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createPurchaseInvoice(payload) {
  const { data, error } = await supabase.rpc('create_purchase_invoice', {
    p_supplier_id: payload.supplier_id || null,
    p_paid_amount: payload.paid_amount,
    p_discount: payload.discount,
    p_extra_cost: payload.extra_cost,
    p_notes: payload.notes || '',
    p_items: payload.items,
  });

  if (error) throw error;
  return data;
}

export async function getPurchasesHistory() {
  const { data, error } = await supabase
    .from('purchases')
    .select('id,invoice_number,total_amount,paid_amount,due_amount,status,purchase_date,suppliers(name)')
    .order('purchase_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

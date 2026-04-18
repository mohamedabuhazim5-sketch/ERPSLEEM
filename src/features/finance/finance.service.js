import { supabase } from '../../lib/supabase';

export async function createReceipt(payload) {
  const { data, error } = await supabase.rpc('create_receipt', {
    p_customer_id: payload.customer_id || null,
    p_sale_id: payload.sale_id || null,
    p_amount: payload.amount,
    p_payment_method: payload.payment_method,
    p_notes: payload.notes || '',
  });

  if (error) throw error;
  return data;
}

export async function createPaymentVoucher(payload) {
  const { data, error } = await supabase.rpc('create_payment_voucher', {
    p_supplier_id: payload.supplier_id || null,
    p_purchase_id: payload.purchase_id || null,
    p_amount: payload.amount,
    p_payment_method: payload.payment_method,
    p_notes: payload.notes || '',
  });

  if (error) throw error;
  return data;
}

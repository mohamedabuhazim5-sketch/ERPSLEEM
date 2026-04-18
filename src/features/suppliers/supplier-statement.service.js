import { supabase } from '../../lib/supabase';

export async function getSupplierStatement(supplierId) {
  const [supplierRes, purchasesRes, vouchersRes] = await Promise.all([
    supabase.from('suppliers').select('id,name,phone,address,balance').eq('id', supplierId).single(),
    supabase
      .from('purchases')
      .select('id,invoice_number,total_amount,paid_amount,due_amount,purchase_date,status')
      .eq('supplier_id', supplierId)
      .order('purchase_date', { ascending: false }),
    supabase
      .from('payments_vouchers')
      .select('id,voucher_number,amount,payment_method,voucher_date,notes')
      .eq('supplier_id', supplierId)
      .order('voucher_date', { ascending: false }),
  ]);

  if (supplierRes.error) throw supplierRes.error;
  if (purchasesRes.error) throw purchasesRes.error;
  if (vouchersRes.error) throw vouchersRes.error;

  return {
    supplier: supplierRes.data,
    purchases: purchasesRes.data || [],
    vouchers: vouchersRes.data || [],
  };
}

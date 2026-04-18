import { supabase } from '../../lib/supabase';

export async function getSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id,name,phone,address,balance,is_active,created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createSupplier(payload) {
  const { data, error } = await supabase.from('suppliers').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateSupplier(id, payload) {
  const { data, error } = await supabase.from('suppliers').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deactivateSupplier(id) {
  const { data, error } = await supabase
    .from('suppliers')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

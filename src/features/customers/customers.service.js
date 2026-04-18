import { supabase } from '../../lib/supabase';

export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('id,name,phone,address,balance,is_active,created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCustomer(payload) {
  const { data, error } = await supabase.from('customers').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateCustomer(id, payload) {
  const { data, error } = await supabase.from('customers').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deactivateCustomer(id) {
  const { data, error } = await supabase
    .from('customers')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

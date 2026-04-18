import { supabase } from '../../lib/supabase';

export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('id,title,category,amount,expense_date,notes,created_at')
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createExpense(payload) {
  const { data, error } = await supabase.from('expenses').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateExpense(id, payload) {
  const { data, error } = await supabase.from('expenses').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

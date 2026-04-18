import { supabase } from '../../lib/supabase';

export async function getUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,full_name,email,role,is_active,created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateUserRole(id, role) {
  const { data, error } = await supabase.from('profiles').update({ role }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

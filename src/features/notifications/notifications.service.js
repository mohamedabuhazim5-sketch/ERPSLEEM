import { supabase } from '../../lib/supabase';

export async function getNotifications(role) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`target_role.is.null,target_role.eq.${role}`)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(id) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

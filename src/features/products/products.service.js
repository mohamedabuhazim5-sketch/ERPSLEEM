import { supabase } from '../../lib/supabase';

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id,name,sku,purchase_price,sale_price,stock_qty,min_stock,is_active,image_url,created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProduct(payload) {
  const { data, error } = await supabase.from('products').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, payload) {
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deactivateProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}


export async function activateProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

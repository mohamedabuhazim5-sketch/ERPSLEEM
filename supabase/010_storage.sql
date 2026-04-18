insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "authenticated can view product images" on storage.objects;
create policy "authenticated can view product images"
on storage.objects
for select
to authenticated
using (bucket_id = 'product-images');

drop policy if exists "admin and storekeeper can upload product images" on storage.objects;
create policy "admin and storekeeper can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.get_my_role() in ('admin', 'storekeeper')
);

drop policy if exists "admin and storekeeper can update product images" on storage.objects;
create policy "admin and storekeeper can update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.get_my_role() in ('admin', 'storekeeper')
)
with check (
  bucket_id = 'product-images'
  and public.get_my_role() in ('admin', 'storekeeper')
);

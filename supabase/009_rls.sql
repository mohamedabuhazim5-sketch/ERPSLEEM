alter table profiles enable row level security;
alter table employees enable row level security;
alter table customers enable row level security;
alter table suppliers enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table expenses enable row level security;
alter table stock_movements enable row level security;
alter table customer_payments enable row level security;
alter table supplier_payments enable row level security;
alter table settings enable row level security;
alter table audit_logs enable row level security;
alter table receipts enable row level security;
alter table payments_vouchers enable row level security;
alter table notifications enable row level security;
alter table sales_returns enable row level security;
alter table sales_return_items enable row level security;
alter table purchase_returns enable row level security;
alter table purchase_return_items enable row level security;

drop policy if exists "authenticated users can read products" on products;
create policy "authenticated users can read products"
on products for select to authenticated using (true);

drop policy if exists "admin or storekeeper can modify products" on products;
create policy "admin or storekeeper can modify products"
on products for all to authenticated
using (public.get_my_role() in ('admin','storekeeper'))
with check (public.get_my_role() in ('admin','storekeeper'));

drop policy if exists "authenticated users can read customers" on customers;
create policy "authenticated users can read customers"
on customers for select to authenticated
using (public.get_my_role() in ('admin','cashier','accountant'));

drop policy if exists "admin cashier accountant manage customers" on customers;
create policy "admin cashier accountant manage customers"
on customers for all to authenticated
using (public.get_my_role() in ('admin','cashier','accountant'))
with check (public.get_my_role() in ('admin','cashier','accountant'));

drop policy if exists "authenticated users can read suppliers" on suppliers;
create policy "authenticated users can read suppliers"
on suppliers for select to authenticated
using (public.get_my_role() in ('admin','storekeeper','accountant'));

drop policy if exists "admin storekeeper accountant manage suppliers" on suppliers;
create policy "admin storekeeper accountant manage suppliers"
on suppliers for all to authenticated
using (public.get_my_role() in ('admin','storekeeper','accountant'))
with check (public.get_my_role() in ('admin','storekeeper','accountant'));

drop policy if exists "users read settings by auth" on settings;
create policy "users read settings by auth"
on settings for select to authenticated using (true);

drop policy if exists "admin update settings" on settings;
create policy "admin update settings"
on settings for update to authenticated
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

drop policy if exists "admin reads audit logs" on audit_logs;
create policy "admin reads audit logs"
on audit_logs for select to authenticated
using (public.get_my_role() = 'admin');

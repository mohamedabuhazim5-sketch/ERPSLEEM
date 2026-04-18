insert into categories (name, description)
values
('ستاير','قسم الستاير'),
('كنب','قسم الكنب'),
('انتريه','قسم الانتريهات')
on conflict do nothing;

insert into settings (company_name, currency, invoice_prefix_sales, invoice_prefix_purchases)
values ('Sleem ERP', 'EGP', 'SLM-S', 'SLM-P')
on conflict do nothing;

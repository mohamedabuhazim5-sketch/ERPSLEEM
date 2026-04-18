create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique,
  role text not null default 'cashier' check (role in ('admin','cashier','storekeeper','accountant')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  job_title text,
  salary numeric(12,2) not null default 0,
  commission_rate numeric(5,2) not null default 0,
  user_id uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  notes text,
  balance numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  notes text,
  balance numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique,
  category_id uuid references categories(id) on delete set null,
  unit text not null default 'piece',
  purchase_price numeric(12,2) not null default 0,
  sale_price numeric(12,2) not null default 0,
  min_stock numeric(12,2) not null default 0,
  stock_qty numeric(12,2) not null default 0,
  image_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete restrict,
  invoice_number text not null unique,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  extra_cost numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  due_amount numeric(12,2) not null default 0,
  status text not null default 'unpaid' check (status in ('paid','partial','unpaid','cancelled')),
  purchase_date timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  qty numeric(12,2) not null check (qty > 0),
  unit_cost numeric(12,2) not null default 0,
  total_cost numeric(12,2) not null default 0
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  invoice_number text not null unique,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  due_amount numeric(12,2) not null default 0,
  payment_method text not null default 'cash' check (payment_method in ('cash','deferred','transfer','mixed')),
  status text not null default 'paid' check (status in ('paid','partial','unpaid','cancelled')),
  total_profit numeric(12,2) not null default 0,
  sale_date timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  qty numeric(12,2) not null check (qty > 0),
  unit_price numeric(12,2) not null default 0,
  unit_cost numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0,
  line_profit numeric(12,2) not null default 0
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  amount numeric(12,2) not null check (amount >= 0),
  expense_date timestamptz not null default now(),
  attachment_url text,
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete restrict,
  movement_type text not null check (movement_type in ('purchase','sale','adjustment','return_in','return_out')),
  reference_type text,
  reference_id uuid,
  qty_before numeric(12,2) not null default 0,
  qty_change numeric(12,2) not null default 0,
  qty_after numeric(12,2) not null default 0,
  note text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'Sleem ERP',
  company_logo_url text,
  phone text,
  address text,
  currency text not null default 'EGP',
  tax_rate numeric(5,2) not null default 0,
  tax_enabled boolean not null default false,
  invoice_prefix_sales text not null default 'SLM-S',
  invoice_prefix_purchases text not null default 'SLM-P',
  low_stock_threshold numeric(12,2) not null default 5,
  language text not null default 'ar',
  dark_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_name on products(name);
create index if not exists idx_products_sku on products(sku);
create index if not exists idx_customers_name on customers(name);
create index if not exists idx_customers_phone on customers(phone);
create index if not exists idx_suppliers_name on suppliers(name);
create index if not exists idx_sales_invoice_number on sales(invoice_number);
create index if not exists idx_purchases_invoice_number on purchases(invoice_number);
create index if not exists idx_stock_movements_product_id on stock_movements(product_id);

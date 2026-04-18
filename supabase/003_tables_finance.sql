create table if not exists customer_payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  sale_id uuid references sales(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  payment_date timestamptz not null default now(),
  method text not null default 'cash',
  notes text,
  created_by uuid references profiles(id) on delete set null
);

create table if not exists supplier_payments (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  purchase_id uuid references purchases(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  payment_date timestamptz not null default now(),
  method text not null default 'cash',
  notes text,
  created_by uuid references profiles(id) on delete set null
);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  sale_id uuid references sales(id) on delete set null,
  receipt_number text not null unique,
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null default 'cash',
  receipt_date timestamptz not null default now(),
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists payments_vouchers (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete set null,
  purchase_id uuid references purchases(id) on delete set null,
  voucher_number text not null unique,
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null default 'cash',
  voucher_date timestamptz not null default now(),
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

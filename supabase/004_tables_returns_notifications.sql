create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info','warning','success','error')),
  is_read boolean not null default false,
  target_role text,
  created_at timestamptz not null default now()
);

create table if not exists sales_returns (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  return_number text not null unique,
  total_amount numeric(12,2) not null default 0,
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists sales_return_items (
  id uuid primary key default gen_random_uuid(),
  sales_return_id uuid not null references sales_returns(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  qty numeric(12,2) not null check (qty > 0),
  unit_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0
);

create table if not exists purchase_returns (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases(id) on delete cascade,
  return_number text not null unique,
  total_amount numeric(12,2) not null default 0,
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists purchase_return_items (
  id uuid primary key default gen_random_uuid(),
  purchase_return_id uuid not null references purchase_returns(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  qty numeric(12,2) not null check (qty > 0),
  unit_cost numeric(12,2) not null default 0,
  total_cost numeric(12,2) not null default 0
);

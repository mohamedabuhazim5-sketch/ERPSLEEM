create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    'cashier'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.get_my_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.generate_invoice_number(prefix text)
returns text
language plpgsql
as $$
declare
  generated text;
begin
  generated := prefix || '-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || upper(substr(gen_random_uuid()::text, 1, 4));
  return generated;
end;
$$;

create or replace function public.generate_receipt_number(prefix text)
returns text
language plpgsql
as $$
declare
  generated text;
begin
  generated := prefix || '-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || upper(substr(gen_random_uuid()::text, 1, 4));
  return generated;
end;
$$;

create or replace function public.log_audit(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_details jsonb
)
returns void
language plpgsql
security definer
as $$
begin
  insert into audit_logs (user_id, action, entity_type, entity_id, details, created_at)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_details, now());
end;
$$;

create or replace function public.create_notification(
  p_title text,
  p_message text,
  p_type text,
  p_target_role text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into notifications (title, message, type, target_role)
  values (p_title, p_message, coalesce(p_type, 'info'), p_target_role);
end;
$$;

create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

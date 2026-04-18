create or replace function public.create_receipt(
  p_customer_id uuid,
  p_sale_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_notes text
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_receipt_id uuid;
  v_receipt_number text;
begin
  if p_amount <= 0 then
    raise exception 'قيمة سند القبض يجب أن تكون أكبر من صفر';
  end if;

  v_receipt_number := public.generate_receipt_number('SLM-R');

  insert into receipts (
    customer_id, sale_id, receipt_number, amount, payment_method, receipt_date, notes, created_by
  ) values (
    p_customer_id, p_sale_id, v_receipt_number, p_amount, p_payment_method, now(), p_notes, auth.uid()
  ) returning id into v_receipt_id;

  if p_customer_id is not null then
    update customers
    set balance = greatest(coalesce(balance, 0) - p_amount, 0)
    where id = p_customer_id;
  end if;

  if p_sale_id is not null then
    update sales
    set paid_amount = coalesce(paid_amount, 0) + p_amount,
        due_amount = greatest(coalesce(total_amount, 0) - (coalesce(paid_amount, 0) + p_amount), 0),
        status = case
          when greatest(coalesce(total_amount, 0) - (coalesce(paid_amount, 0) + p_amount), 0) = 0 then 'paid'
          else 'partial'
        end
    where id = p_sale_id;
  end if;

  perform public.log_audit('create', 'receipt', v_receipt_id, jsonb_build_object('amount', p_amount, 'customer_id', p_customer_id, 'sale_id', p_sale_id));
  return v_receipt_id;
end;
$$;

create or replace function public.create_payment_voucher(
  p_supplier_id uuid,
  p_purchase_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_notes text
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_voucher_id uuid;
  v_voucher_number text;
begin
  if p_amount <= 0 then
    raise exception 'قيمة سند الدفع يجب أن تكون أكبر من صفر';
  end if;

  v_voucher_number := public.generate_receipt_number('SLM-PV');

  insert into payments_vouchers (
    supplier_id, purchase_id, voucher_number, amount, payment_method, voucher_date, notes, created_by
  ) values (
    p_supplier_id, p_purchase_id, v_voucher_number, p_amount, p_payment_method, now(), p_notes, auth.uid()
  ) returning id into v_voucher_id;

  if p_supplier_id is not null then
    update suppliers
    set balance = greatest(coalesce(balance, 0) - p_amount, 0)
    where id = p_supplier_id;
  end if;

  if p_purchase_id is not null then
    update purchases
    set paid_amount = coalesce(paid_amount, 0) + p_amount,
        due_amount = greatest(coalesce(total_amount, 0) - (coalesce(paid_amount, 0) + p_amount), 0),
        status = case
          when greatest(coalesce(total_amount, 0) - (coalesce(paid_amount, 0) + p_amount), 0) = 0 then 'paid'
          else 'partial'
        end
    where id = p_purchase_id;
  end if;

  perform public.log_audit('create', 'payment_voucher', v_voucher_id, jsonb_build_object('amount', p_amount, 'supplier_id', p_supplier_id, 'purchase_id', p_purchase_id));
  return v_voucher_id;
end;
$$;

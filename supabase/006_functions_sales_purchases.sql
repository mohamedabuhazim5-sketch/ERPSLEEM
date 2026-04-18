create or replace function public.create_sale_invoice(
  p_customer_id uuid,
  p_payment_method text,
  p_paid_amount numeric,
  p_discount numeric,
  p_tax numeric,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_sale_id uuid;
  v_invoice_number text;
  v_subtotal numeric := 0;
  v_total_amount numeric := 0;
  v_due_amount numeric := 0;
  v_total_profit numeric := 0;
  v_product_id uuid;
  v_qty numeric;
  v_unit_price numeric;
  v_current_cost numeric;
  v_stock_before numeric;
  v_stock_after numeric;
  v_line_total numeric;
  v_line_profit numeric;
  item jsonb;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'لا يمكن حفظ فاتورة بدون أصناف';
  end if;

  v_invoice_number := public.generate_invoice_number('SLM-S');

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (item->>'product_id')::uuid;
    v_qty := coalesce((item->>'qty')::numeric, 0);

    if v_qty <= 0 then
      raise exception 'الكمية يجب أن تكون أكبر من صفر';
    end if;

    select sale_price, purchase_price, stock_qty
    into v_unit_price, v_current_cost, v_stock_before
    from products
    where id = v_product_id
    for update;

    if not found then
      raise exception 'منتج غير موجود';
    end if;

    if v_stock_before < v_qty then
      raise exception 'المخزون غير كاف';
    end if;

    v_line_total := v_unit_price * v_qty;
    v_line_profit := (v_unit_price - v_current_cost) * v_qty;

    v_subtotal := v_subtotal + v_line_total;
    v_total_profit := v_total_profit + v_line_profit;
  end loop;

  v_total_amount := v_subtotal - coalesce(p_discount, 0) + coalesce(p_tax, 0);
  v_due_amount := greatest(v_total_amount - coalesce(p_paid_amount, 0), 0);

  insert into sales (
    customer_id, invoice_number, subtotal, discount, tax, total_amount,
    paid_amount, due_amount, payment_method, status, total_profit,
    sale_date, created_by, notes
  ) values (
    p_customer_id,
    v_invoice_number,
    v_subtotal,
    coalesce(p_discount, 0),
    coalesce(p_tax, 0),
    v_total_amount,
    coalesce(p_paid_amount, 0),
    v_due_amount,
    p_payment_method,
    case
      when v_due_amount = 0 then 'paid'
      when coalesce(p_paid_amount, 0) = 0 then 'unpaid'
      else 'partial'
    end,
    v_total_profit,
    now(),
    auth.uid(),
    p_notes
  )
  returning id into v_sale_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (item->>'product_id')::uuid;
    v_qty := coalesce((item->>'qty')::numeric, 0);

    select sale_price, purchase_price, stock_qty
    into v_unit_price, v_current_cost, v_stock_before
    from products
    where id = v_product_id
    for update;

    v_stock_after := v_stock_before - v_qty;
    v_line_total := v_unit_price * v_qty;
    v_line_profit := (v_unit_price - v_current_cost) * v_qty;

    insert into sale_items (
      sale_id, product_id, qty, unit_price, unit_cost, discount, total_price, line_profit
    ) values (
      v_sale_id, v_product_id, v_qty, v_unit_price, v_current_cost, 0, v_line_total, v_line_profit
    );

    update products set stock_qty = v_stock_after where id = v_product_id;

    insert into stock_movements (
      product_id, movement_type, reference_type, reference_id,
      qty_before, qty_change, qty_after, note, created_by
    ) values (
      v_product_id, 'sale', 'sales', v_sale_id,
      v_stock_before, -v_qty, v_stock_after, 'فاتورة بيع ' || v_invoice_number, auth.uid()
    );
  end loop;

  if p_customer_id is not null and v_due_amount > 0 then
    update customers
    set balance = coalesce(balance, 0) + v_due_amount
    where id = p_customer_id;
  end if;

  perform public.log_audit(
    'create',
    'sale',
    v_sale_id,
    jsonb_build_object('invoice_number', v_invoice_number, 'total_amount', v_total_amount, 'customer_id', p_customer_id)
  );

  return v_sale_id;
end;
$$;

create or replace function public.create_purchase_invoice(
  p_supplier_id uuid,
  p_paid_amount numeric,
  p_discount numeric,
  p_extra_cost numeric,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_purchase_id uuid;
  v_invoice_number text;
  v_subtotal numeric := 0;
  v_total_amount numeric := 0;
  v_due_amount numeric := 0;
  v_product_id uuid;
  v_qty numeric;
  v_unit_cost numeric;
  v_stock_before numeric;
  v_stock_after numeric;
  v_line_total numeric;
  item jsonb;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'لا يمكن حفظ فاتورة شراء بدون أصناف';
  end if;

  v_invoice_number := public.generate_invoice_number('SLM-P');

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (item->>'product_id')::uuid;
    v_qty := coalesce((item->>'qty')::numeric, 0);
    v_unit_cost := coalesce((item->>'unit_cost')::numeric, 0);
    if v_qty <= 0 then
      raise exception 'الكمية يجب أن تكون أكبر من صفر';
    end if;
    v_line_total := v_qty * v_unit_cost;
    v_subtotal := v_subtotal + v_line_total;
  end loop;

  v_total_amount := v_subtotal - coalesce(p_discount, 0) + coalesce(p_extra_cost, 0);
  v_due_amount := greatest(v_total_amount - coalesce(p_paid_amount, 0), 0);

  insert into purchases (
    supplier_id, invoice_number, subtotal, discount, extra_cost,
    total_amount, paid_amount, due_amount, status, purchase_date,
    created_by, notes
  ) values (
    p_supplier_id,
    v_invoice_number,
    v_subtotal,
    coalesce(p_discount, 0),
    coalesce(p_extra_cost, 0),
    v_total_amount,
    coalesce(p_paid_amount, 0),
    v_due_amount,
    case
      when v_due_amount = 0 then 'paid'
      when coalesce(p_paid_amount, 0) = 0 then 'unpaid'
      else 'partial'
    end,
    now(),
    auth.uid(),
    p_notes
  ) returning id into v_purchase_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (item->>'product_id')::uuid;
    v_qty := coalesce((item->>'qty')::numeric, 0);
    v_unit_cost := coalesce((item->>'unit_cost')::numeric, 0);

    select stock_qty into v_stock_before
    from products
    where id = v_product_id
    for update;

    if not found then
      raise exception 'منتج غير موجود';
    end if;

    v_stock_after := v_stock_before + v_qty;
    v_line_total := v_qty * v_unit_cost;

    insert into purchase_items (
      purchase_id, product_id, qty, unit_cost, total_cost
    ) values (
      v_purchase_id, v_product_id, v_qty, v_unit_cost, v_line_total
    );

    update products
    set stock_qty = v_stock_after,
        purchase_price = v_unit_cost
    where id = v_product_id;

    insert into stock_movements (
      product_id, movement_type, reference_type, reference_id,
      qty_before, qty_change, qty_after, note, created_by
    ) values (
      v_product_id, 'purchase', 'purchases', v_purchase_id,
      v_stock_before, v_qty, v_stock_after, 'فاتورة شراء ' || v_invoice_number, auth.uid()
    );
  end loop;

  if p_supplier_id is not null and v_due_amount > 0 then
    update suppliers set balance = coalesce(balance, 0) + v_due_amount where id = p_supplier_id;
  end if;

  perform public.log_audit(
    'create',
    'purchase',
    v_purchase_id,
    jsonb_build_object('invoice_number', v_invoice_number, 'total_amount', v_total_amount, 'supplier_id', p_supplier_id)
  );

  return v_purchase_id;
end;
$$;

create or replace function public.cancel_sale_invoice(
  p_sale_id uuid,
  p_notes text
)
returns void
language plpgsql
security definer
as $$
declare
  item record;
  v_customer_id uuid;
  v_due_amount numeric;
  v_stock_before numeric;
  v_stock_after numeric;
begin
  select customer_id, due_amount
  into v_customer_id, v_due_amount
  from sales
  where id = p_sale_id
  for update;

  if not found then
    raise exception 'الفاتورة غير موجودة';
  end if;

  if exists(select 1 from sales where id = p_sale_id and status = 'cancelled') then
    raise exception 'الفاتورة ملغاة بالفعل';
  end if;

  for item in select product_id, qty from sale_items where sale_id = p_sale_id
  loop
    select stock_qty into v_stock_before from products where id = item.product_id for update;
    v_stock_after := v_stock_before + item.qty;

    update products set stock_qty = v_stock_after where id = item.product_id;

    insert into stock_movements (
      product_id, movement_type, reference_type, reference_id,
      qty_before, qty_change, qty_after, note, created_by
    ) values (
      item.product_id, 'return_in', 'sales_cancel', p_sale_id,
      v_stock_before, item.qty, v_stock_after, coalesce(p_notes, 'إلغاء فاتورة بيع'), auth.uid()
    );
  end loop;

  update sales
  set status = 'cancelled',
      due_amount = 0,
      notes = coalesce(notes, '') || E'\n[Cancelled] ' || coalesce(p_notes, '')
  where id = p_sale_id;

  if v_customer_id is not null and v_due_amount > 0 then
    update customers
    set balance = greatest(coalesce(balance, 0) - v_due_amount, 0)
    where id = v_customer_id;
  end if;

  perform public.log_audit('cancel', 'sale', p_sale_id, jsonb_build_object('note', p_notes));
end;
$$;

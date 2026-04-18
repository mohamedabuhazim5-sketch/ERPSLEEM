create or replace function public.create_sales_return(
  p_sale_id uuid,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_return_id uuid;
  v_return_number text;
  v_total numeric := 0;
  v_product_id uuid;
  v_qty numeric;
  v_unit_price numeric;
  v_stock_before numeric;
  v_stock_after numeric;
  item jsonb;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'لا يمكن حفظ مردود بيع بدون أصناف';
  end if;

  v_return_number := public.generate_receipt_number('SLM-SR');

  insert into sales_returns (sale_id, return_number, notes, created_by)
  values (p_sale_id, v_return_number, p_notes, auth.uid())
  returning id into v_return_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (item->>'product_id')::uuid;
    v_qty := coalesce((item->>'qty')::numeric, 0);

    select unit_price into v_unit_price
    from sale_items
    where sale_id = p_sale_id and product_id = v_product_id
    limit 1;

    if v_unit_price is null then
      raise exception 'الصنف غير موجود داخل فاتورة البيع الأصلية';
    end if;

    select stock_qty into v_stock_before from products where id = v_product_id for update;
    v_stock_after := v_stock_before + v_qty;

    insert into sales_return_items (sales_return_id, product_id, qty, unit_price, total_price)
    values (v_return_id, v_product_id, v_qty, v_unit_price, v_unit_price * v_qty);

    update products set stock_qty = v_stock_after where id = v_product_id;

    insert into stock_movements (
      product_id, movement_type, reference_type, reference_id,
      qty_before, qty_change, qty_after, note, created_by
    ) values (
      v_product_id, 'return_in', 'sales_returns', v_return_id,
      v_stock_before, v_qty, v_stock_after, 'مردود بيع ' || v_return_number, auth.uid()
    );

    v_total := v_total + (v_unit_price * v_qty);
  end loop;

  update sales_returns set total_amount = v_total where id = v_return_id;

  perform public.log_audit('create', 'sales_return', v_return_id, jsonb_build_object('sale_id', p_sale_id, 'total_amount', v_total));
  return v_return_id;
end;
$$;

create or replace function public.create_purchase_return(
  p_purchase_id uuid,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_return_id uuid;
  v_return_number text;
  v_total numeric := 0;
  v_product_id uuid;
  v_qty numeric;
  v_unit_cost numeric;
  v_stock_before numeric;
  v_stock_after numeric;
  item jsonb;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'لا يمكن حفظ مردود شراء بدون أصناف';
  end if;

  v_return_number := public.generate_receipt_number('SLM-PR');

  insert into purchase_returns (purchase_id, return_number, notes, created_by)
  values (p_purchase_id, v_return_number, p_notes, auth.uid())
  returning id into v_return_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (item->>'product_id')::uuid;
    v_qty := coalesce((item->>'qty')::numeric, 0);

    select unit_cost into v_unit_cost
    from purchase_items
    where purchase_id = p_purchase_id and product_id = v_product_id
    limit 1;

    if v_unit_cost is null then
      raise exception 'الصنف غير موجود داخل فاتورة الشراء الأصلية';
    end if;

    select stock_qty into v_stock_before from products where id = v_product_id for update;
    if v_stock_before < v_qty then
      raise exception 'المخزون الحالي لا يسمح بمردود الشراء لهذا الصنف';
    end if;

    v_stock_after := v_stock_before - v_qty;

    insert into purchase_return_items (purchase_return_id, product_id, qty, unit_cost, total_cost)
    values (v_return_id, v_product_id, v_qty, v_unit_cost, v_unit_cost * v_qty);

    update products set stock_qty = v_stock_after where id = v_product_id;

    insert into stock_movements (
      product_id, movement_type, reference_type, reference_id,
      qty_before, qty_change, qty_after, note, created_by
    ) values (
      v_product_id, 'return_out', 'purchase_returns', v_return_id,
      v_stock_before, -v_qty, v_stock_after, 'مردود شراء ' || v_return_number, auth.uid()
    );

    v_total := v_total + (v_unit_cost * v_qty);
  end loop;

  update purchase_returns set total_amount = v_total where id = v_return_id;

  perform public.log_audit('create', 'purchase_return', v_return_id, jsonb_build_object('purchase_id', p_purchase_id, 'total_amount', v_total));
  return v_return_id;
end;
$$;

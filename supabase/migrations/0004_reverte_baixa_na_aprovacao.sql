-- Reverte a 0003: a baixa volta a acontecer no fechamento do pedido.
--
-- O comportamento original estava certo: o comprador já retira o produto da
-- prateleira e só depois o pagamento é conferido. Então o estoque tem que
-- sair na hora, e voltar se o pedido for rejeitado.
--
-- Restaura create_order e review_order como estavam na 0001 e remove as
-- funções de disponibilidade introduzidas pela 0003.
--
-- Sem correção de dados: quando esta migração foi escrita não havia pedidos
-- pendentes. Os 4 que existiam sob a 0003 foram aprovados ainda sob ela, e a
-- devolução pontual da 0003 havia reposto exatamente o mesmo saldo — cada
-- item foi descontado uma única vez.

drop function if exists public.catalog_products(text);
drop function if exists public.reserved_stock(uuid);

create or replace function public.create_order(p_items jsonb, p_receipt_path text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_order_id uuid;
  v_total integer := 0;
  v_item record;
  v_product public.products%rowtype;
begin
  if v_user is null then
    raise exception 'Não autenticado';
  end if;
  if not exists (select 1 from public.profiles where id = v_user and active) then
    raise exception 'Usuário inativo';
  end if;
  if p_receipt_path is null or p_receipt_path = '' then
    raise exception 'Comprovante obrigatório';
  end if;
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'Carrinho vazio';
  end if;

  insert into public.orders (user_id, total_cents, receipt_path)
  values (v_user, 0, p_receipt_path)
  returning id into v_order_id;

  for v_item in
    select (e ->> 'product_id')::uuid as product_id, (e ->> 'quantity')::int as quantity
    from jsonb_array_elements(p_items) e
  loop
    if v_item.quantity is null or v_item.quantity <= 0 then
      raise exception 'Quantidade inválida';
    end if;

    -- A baixa é aqui: o update condicional garante, de forma atômica, que
    -- dois pedidos concorrentes não levem o mesmo último item.
    update public.products
      set stock = stock - v_item.quantity, updated_at = now()
      where id = v_item.product_id and active and stock >= v_item.quantity
      returning * into v_product;

    if v_product.id is null then
      raise exception 'Produto sem estoque suficiente ou indisponível';
    end if;

    insert into public.order_items (order_id, product_id, product_name, unit_price_cents, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.price_cents, v_item.quantity);

    v_total := v_total + v_product.price_cents * v_item.quantity;
  end loop;

  update public.orders set total_cents = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

create or replace function public.review_order(p_order_id uuid, p_approve boolean, p_note text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if v_order.id is null then
    raise exception 'Pedido não encontrado';
  end if;
  if v_order.status <> 'pending' then
    raise exception 'Pedido já conferido';
  end if;
  if not p_approve and (p_note is null or btrim(p_note) = '') then
    raise exception 'Observação é obrigatória ao rejeitar';
  end if;

  -- Aprovar não mexe no estoque (já saiu na compra). Rejeitar devolve.
  if not p_approve then
    for v_item in
      select product_id, quantity from public.order_items
      where order_id = p_order_id and product_id is not null
    loop
      update public.products
        set stock = stock + v_item.quantity, updated_at = now()
        where id = v_item.product_id;
    end loop;
  end if;

  update public.orders
    set status = case when p_approve then 'approved' else 'rejected' end,
        review_note = p_note,
        reviewed_by = auth.uid(),
        reviewed_at = now()
    where id = p_order_id;
end;
$$;

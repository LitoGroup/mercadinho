-- Baixa de estoque somente na aprovação do pedido.
--
-- Antes: create_order já descontava o estoque e review_order devolvia quando
-- rejeitado. O admin via o item sair do estoque assim que o comprador fechava
-- a compra, antes de qualquer conferência.
--
-- Agora: o pedido pendente apenas RESERVA a quantidade (derivada de
-- order_items dos pedidos com status 'pending'). O saldo em products.stock —
-- o estoque físico — só muda quando o admin aprova. Rejeitar não mexe em
-- estoque, a reserva simplesmente deixa de existir.

-- ===== Disponibilidade = estoque físico - reservado em pedidos pendentes =====

create or replace function public.reserved_stock(p_product_id uuid)
returns integer
language sql
security definer set search_path = public
stable
as $$
  select coalesce(sum(oi.quantity), 0)::int
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.product_id = p_product_id and o.status = 'pending';
$$;

-- Catálogo da loja: o comprador enxerga o disponível, não o saldo físico.
-- security definer porque o cálculo da reserva soma pedidos de outros
-- usuários, que a RLS de order_items (corretamente) esconde.
create or replace function public.catalog_products(p_q text default null)
returns table (
  id uuid,
  ean text,
  name text,
  description text,
  category text,
  price_cents integer,
  stock integer,
  reserved integer,
  available integer,
  image_path text
)
language sql
security definer set search_path = public
stable
as $$
  with reservado as (
    select oi.product_id, sum(oi.quantity)::int as qty
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.status = 'pending' and oi.product_id is not null
    group by oi.product_id
  )
  select
    p.id,
    p.ean,
    p.name,
    p.description,
    p.category,
    p.price_cents,
    p.stock,
    coalesce(r.qty, 0),
    greatest(p.stock - coalesce(r.qty, 0), 0),
    p.image_path
  from public.products p
  left join reservado r on r.product_id = p.id
  where auth.uid() is not null
    and p.active
    and p.stock - coalesce(r.qty, 0) > 0
    and (
      p_q is null or btrim(p_q) = ''
      or p.name ilike '%' || p_q || '%'
      or p.category ilike '%' || p_q || '%'
    )
  order by p.name;
$$;

-- ===== create_order: reserva, não dá baixa =====

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
  v_reservado integer;
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

    -- for update serializa dois pedidos concorrentes do mesmo produto, para
    -- que a soma das reservas não passe do estoque físico.
    select * into v_product
      from public.products
      where id = v_item.product_id and active
      for update;

    if v_product.id is null then
      raise exception 'Produto sem estoque suficiente ou indisponível';
    end if;

    -- Inclui os itens já inseridos deste próprio pedido, então o mesmo
    -- produto repetido em p_items é somado corretamente.
    select coalesce(sum(oi.quantity), 0)::int into v_reservado
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.product_id = v_item.product_id and o.status = 'pending';

    if v_product.stock - v_reservado < v_item.quantity then
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

-- ===== review_order: aprovar dá a baixa; rejeitar não mexe no estoque =====

create or replace function public.review_order(p_order_id uuid, p_approve boolean, p_note text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_updated uuid;
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

  if p_approve then
    for v_item in
      select product_id, product_name, quantity from public.order_items
      where order_id = p_order_id and product_id is not null
    loop
      update public.products
        set stock = stock - v_item.quantity, updated_at = now()
        where id = v_item.product_id and stock >= v_item.quantity
        returning id into v_updated;

      if v_updated is null then
        raise exception 'Estoque insuficiente para % na aprovação', v_item.product_name;
      end if;
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

-- ===== Correção pontual dos pedidos pendentes já existentes =====
--
-- Pedidos pendentes criados na lógica antiga JÁ tiveram o estoque descontado.
-- Sob a lógica nova eles só reservam e serão descontados na aprovação — sem
-- devolver esse saldo agora, o desconto aconteceria duas vezes.
-- Roda uma única vez, junto desta migração.

do $$
declare
  v_item record;
begin
  for v_item in
    select oi.product_id, sum(oi.quantity)::int as quantity
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.status = 'pending' and oi.product_id is not null
    group by oi.product_id
  loop
    update public.products
      set stock = stock + v_item.quantity, updated_at = now()
      where id = v_item.product_id;
  end loop;
end;
$$;

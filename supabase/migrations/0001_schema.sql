-- Mercadinho: schema inicial
-- Tabelas, RLS, funções transacionais e buckets de storage.

-- ===== Tabelas =====

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  ean text,
  name text not null,
  description text not null default '',
  category text not null default 'Outros',
  price_cents integer not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_path text,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  total_cents integer not null check (total_cents >= 0),
  receipt_path text not null,
  review_note text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id),
  product_name text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0)
);

create table public.settings (
  id integer primary key default 1 check (id = 1),
  pix_key text not null default '',
  pix_key_type text not null default 'email'
    check (pix_key_type in ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria')),
  merchant_name text not null default 'Mercadinho',
  merchant_city text not null default 'BRASIL',
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1);

create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_created_idx on public.orders (created_at desc);
create index products_active_idx on public.products (active, name);

-- ===== Trigger: cria profile ao criar usuário =====

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== Helper de autorização =====

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and active
  );
$$;

-- ===== RLS =====

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;

create policy "profiles: ver o próprio" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: admin gerencia" on public.profiles
  for update using (public.is_admin());

create policy "products: clientes veem ativos" on public.products
  for select using (active or public.is_admin());
create policy "products: admin insere" on public.products
  for insert with check (public.is_admin());
create policy "products: admin atualiza" on public.products
  for update using (public.is_admin());
create policy "products: admin remove" on public.products
  for delete using (public.is_admin());

create policy "orders: dono ou admin veem" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
-- INSERT/UPDATE apenas via funções security definer

create policy "order_items: via pedido" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "settings: autenticados leem" on public.settings
  for select using (auth.uid() is not null);
create policy "settings: admin atualiza" on public.settings
  for update using (public.is_admin());

-- ===== Funções transacionais =====

-- p_items: [{"product_id": "...", "quantity": 2}, ...]
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

-- ===== Storage =====

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts', 'receipts', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "products: leitura pública" on storage.objects
  for select using (bucket_id = 'products');
create policy "products: admin escreve" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());
create policy "products: admin atualiza" on storage.objects
  for update using (bucket_id = 'products' and public.is_admin());
create policy "products: admin remove" on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());

create policy "receipts: dono envia no próprio prefixo" on storage.objects
  for insert with check (
    bucket_id = 'receipts'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "receipts: dono ou admin leem" on storage.objects
  for select using (
    bucket_id = 'receipts'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

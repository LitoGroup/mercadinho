-- Controle de estoque: histórico de movimentações.
-- Um trigger registra QUALQUER mudança de estoque (venda, devolução por
-- rejeição, ajuste manual), com autor e saldo resultante.

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  delta integer not null,
  stock_after integer not null,
  changed_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index stock_movements_product_idx on public.stock_movements (product_id, created_at desc);
create index stock_movements_created_idx on public.stock_movements (created_at desc);

alter table public.stock_movements enable row level security;

create policy "stock_movements: admin lê" on public.stock_movements
  for select using (public.is_admin());
-- INSERT apenas via trigger (security definer)

create or replace function public.log_stock_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.stock is distinct from old.stock then
    insert into public.stock_movements (product_id, delta, stock_after, changed_by)
    values (new.id, new.stock - old.stock, new.stock, auth.uid());
  end if;
  return new;
end;
$$;

create trigger on_product_stock_change
  after update on public.products
  for each row execute function public.log_stock_change();

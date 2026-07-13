-- =====================================================================
-- KUBASILE — Schema
-- COPIE TUDO e cole no SQL Editor do seu projeto Supabase, e execute.
-- Depois: Storage → confirmar bucket 'kubasile-photos' público.
-- =====================================================================

create extension if not exists "pgcrypto";

do $$ begin
  create type public.app_role as enum ('admin','operator','citizen');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_status as enum ('open','in_progress','resolved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.alert_severity as enum ('low','medium','critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_category as enum ('recharge','food','stationery','other');
exception when duplicate_object then null; end $$;

-- ============================ TABELAS ================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text,
  gender text check (gender in ('M','F','Outro')),
  address text,
  area text,
  avatar_url text,
  points int not null default 0,
  total_g int not null default 0,
  reports_count int not null default 0,
  eco_point_id uuid,
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists blocked boolean not null default false;
create unique index if not exists profiles_phone_unique on public.profiles(phone) where phone is not null;
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create table if not exists public.eco_points (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  materials text[] not null default '{}',
  active boolean not null default true,
  operator_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.eco_points to anon, authenticated;
grant insert, update, delete on public.eco_points to authenticated;
grant all on public.eco_points to service_role;
alter table public.eco_points enable row level security;

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid not null references public.profiles(id) on delete cascade,
  operator_id uuid references public.profiles(id) on delete set null,
  eco_point_id uuid references public.eco_points(id) on delete set null,
  materials text[] not null default '{}',
  weight_g int not null check (weight_g >= 0),
  points int not null default 0,
  photo_url text,
  date timestamptz not null default now()
);
grant select, insert, update, delete on public.deposits to authenticated;
grant all on public.deposits to service_role;
alter table public.deposits enable row level security;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  area text,
  description text,
  lat double precision,
  lng double precision,
  photo_url text,
  status public.report_status not null default 'open',
  date timestamptz not null default now()
);
grant select, insert, update, delete on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references public.profiles(id) on delete set null,
  type text not null default 'trash',
  title text not null,
  description text,
  severity public.alert_severity not null default 'medium',
  area text,
  lat double precision,
  lng double precision,
  date timestamptz not null default now()
);
grant select on public.alerts to anon, authenticated;
grant insert, update, delete on public.alerts to authenticated;
grant all on public.alerts to service_role;
alter table public.alerts enable row level security;

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid not null references public.profiles(id) on delete cascade,
  reward_name text not null,
  points_cost int not null,
  product_id uuid,
  eco_point_id uuid,
  recharge_code text,
  status text not null default 'completed',
  date timestamptz not null default now()
);
alter table public.redemptions add column if not exists product_id uuid;
alter table public.redemptions add column if not exists eco_point_id uuid;
alter table public.redemptions add column if not exists recharge_code text;
alter table public.redemptions add column if not exists status text not null default 'completed';
grant select, insert on public.redemptions to authenticated;
grant all on public.redemptions to service_role;
alter table public.redemptions enable row level security;

-- =========================== MARKETPLACE ============================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.product_category not null,
  points_cost int not null check (points_cost > 0),
  description text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

create table if not exists public.recharge_codes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  code text not null,
  status text not null default 'available' check (status in ('available','reserved','used')),
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  unique (product_id, code)
);
grant select, insert, update, delete on public.recharge_codes to authenticated;
grant all on public.recharge_codes to service_role;
alter table public.recharge_codes enable row level security;

create table if not exists public.product_stock (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  eco_point_id uuid not null references public.eco_points(id) on delete cascade,
  quantity int not null default 0 check (quantity >= 0),
  unique (product_id, eco_point_id)
);
grant select on public.product_stock to anon, authenticated;
grant insert, update, delete on public.product_stock to authenticated;
grant all on public.product_stock to service_role;
alter table public.product_stock enable row level security;

-- ======================= SECURITY DEFINER ============================

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Trocar produto atomicamente
create or replace function public.redeem_product(_product_id uuid, _eco_point_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _prod public.products%rowtype;
  _profile public.profiles%rowtype;
  _code text;
  _code_id uuid;
begin
  if _uid is null then raise exception 'not_authenticated'; end if;

  select * into _prod from public.products where id = _product_id and active = true;
  if not found then raise exception 'product_not_found'; end if;

  select * into _profile from public.profiles where id = _uid for update;
  if _profile.points < _prod.points_cost then raise exception 'insufficient_points'; end if;

  if _prod.category = 'recharge' then
    select id, code into _code_id, _code
      from public.recharge_codes
      where product_id = _product_id and status = 'available'
      order by created_at asc
      limit 1
      for update skip locked;
    if _code is null then raise exception 'out_of_stock'; end if;
    update public.recharge_codes
      set status = 'used', used_by = _uid, used_at = now()
      where id = _code_id;

    insert into public.redemptions (citizen_id, reward_name, points_cost, product_id, recharge_code, status)
      values (_uid, _prod.name, _prod.points_cost, _prod.id, _code, 'completed');
  else
    if _eco_point_id is null then raise exception 'eco_point_required'; end if;
    update public.product_stock
      set quantity = quantity - 1
      where product_id = _product_id and eco_point_id = _eco_point_id and quantity > 0
      returning quantity into _code_id; -- reuse var, ignore
    if not found then raise exception 'out_of_stock'; end if;

    insert into public.redemptions (citizen_id, reward_name, points_cost, product_id, eco_point_id, status)
      values (_uid, _prod.name, _prod.points_cost, _prod.id, _eco_point_id, 'pending_pickup');
  end if;

  update public.profiles set points = points - _prod.points_cost where id = _uid;

  return jsonb_build_object(
    'success', true,
    'product', _prod.name,
    'code', _code,
    'category', _prod.category
  );
end $$;
grant execute on function public.redeem_product(uuid, uuid) to authenticated;

-- ============================== RLS ==================================

drop policy if exists "profiles read all" on public.profiles;
create policy "profiles read all" on public.profiles for select using (true);

drop policy if exists "profiles owner insert" on public.profiles;
create policy "profiles owner insert" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update" on public.profiles for update
  using (auth.uid() = id or public.has_role(auth.uid(),'admin'));

drop policy if exists "roles self read" on public.user_roles;
create policy "roles self read" on public.user_roles for select
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

drop policy if exists "roles admin manage" on public.user_roles;
create policy "roles admin manage" on public.user_roles for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

drop policy if exists "eco read" on public.eco_points;
create policy "eco read" on public.eco_points for select using (true);

drop policy if exists "eco admin write" on public.eco_points;
create policy "eco admin write" on public.eco_points for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

drop policy if exists "deposits read" on public.deposits;
create policy "deposits read" on public.deposits for select
  using (auth.uid() = citizen_id or public.has_role(auth.uid(),'operator') or public.has_role(auth.uid(),'admin'));

drop policy if exists "deposits insert" on public.deposits;
create policy "deposits insert" on public.deposits for insert
  with check (public.has_role(auth.uid(),'operator') or public.has_role(auth.uid(),'admin'));

drop policy if exists "deposits admin write" on public.deposits;
create policy "deposits admin write" on public.deposits for update
  using (public.has_role(auth.uid(),'admin'));

drop policy if exists "reports self read" on public.reports;
create policy "reports self read" on public.reports for select
  using (auth.uid() = citizen_id or public.has_role(auth.uid(),'operator') or public.has_role(auth.uid(),'admin'));

drop policy if exists "reports self insert" on public.reports;
create policy "reports self insert" on public.reports for insert with check (auth.uid() = citizen_id);

drop policy if exists "reports staff update" on public.reports;
create policy "reports staff update" on public.reports for update
  using (public.has_role(auth.uid(),'operator') or public.has_role(auth.uid(),'admin'));

drop policy if exists "alerts read" on public.alerts;
create policy "alerts read" on public.alerts for select using (true);

drop policy if exists "alerts operator insert" on public.alerts;
create policy "alerts operator insert" on public.alerts for insert
  with check (public.has_role(auth.uid(),'operator') or public.has_role(auth.uid(),'admin'));

drop policy if exists "alerts update" on public.alerts;
create policy "alerts update" on public.alerts for update
  using (public.has_role(auth.uid(),'admin') or auth.uid() = operator_id);

drop policy if exists "alerts delete" on public.alerts;
create policy "alerts delete" on public.alerts for delete using (public.has_role(auth.uid(),'admin'));

drop policy if exists "redemptions self" on public.redemptions;
create policy "redemptions self" on public.redemptions for select
  using (auth.uid() = citizen_id or public.has_role(auth.uid(),'admin'));

drop policy if exists "redemptions self insert" on public.redemptions;
create policy "redemptions self insert" on public.redemptions for insert with check (auth.uid() = citizen_id);

-- Products / stock / codes
drop policy if exists "products read" on public.products;
create policy "products read" on public.products for select using (true);
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

drop policy if exists "stock read" on public.product_stock;
create policy "stock read" on public.product_stock for select using (true);
drop policy if exists "stock admin write" on public.product_stock;
create policy "stock admin write" on public.product_stock for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

drop policy if exists "codes admin" on public.recharge_codes;
create policy "codes admin" on public.recharge_codes for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
drop policy if exists "codes owner read" on public.recharge_codes;
create policy "codes owner read" on public.recharge_codes for select
  using (used_by = auth.uid() or public.has_role(auth.uid(),'admin'));

-- ========================== TRIGGERS =================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;

  insert into public.user_roles (user_id, role) values (new.id, 'citizen') on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.after_deposit_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set points = points + coalesce(new.points,0),
         total_g = total_g + coalesce(new.weight_g,0)
   where id = new.citizen_id;
  return new;
end $$;

drop trigger if exists trg_after_deposit_insert on public.deposits;
create trigger trg_after_deposit_insert after insert on public.deposits
  for each row execute function public.after_deposit_insert();

create or replace function public.after_report_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set reports_count = reports_count + 1 where id = new.citizen_id;
  return new;
end $$;

drop trigger if exists trg_after_report_insert on public.reports;
create trigger trg_after_report_insert after insert on public.reports
  for each row execute function public.after_report_insert();

-- =========================== STORAGE =================================
insert into storage.buckets (id, name, public) values ('kubasile-photos','kubasile-photos', true)
on conflict (id) do nothing;

drop policy if exists "photos public read" on storage.objects;
create policy "photos public read" on storage.objects for select using (bucket_id = 'kubasile-photos');

drop policy if exists "photos auth upload" on storage.objects;
create policy "photos auth upload" on storage.objects for insert
  with check (bucket_id = 'kubasile-photos' and auth.role() = 'authenticated');

drop policy if exists "photos auth update" on storage.objects;
create policy "photos auth update" on storage.objects for update
  using (bucket_id = 'kubasile-photos' and auth.role() = 'authenticated');

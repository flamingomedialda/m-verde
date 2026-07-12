-- =====================================================================
-- KUBASILE — Schema inicial
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
  created_at timestamptz not null default now()
);
-- Cada número de telemóvel pertence a apenas um perfil.
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
  date timestamptz not null default now()
);
grant select, insert on public.redemptions to authenticated;
grant all on public.redemptions to service_role;
alter table public.redemptions enable row level security;

-- ======================= SECURITY DEFINER ============================

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

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

create or replace function public.after_redemption_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set points = greatest(points - coalesce(new.points_cost,0), 0)
   where id = new.citizen_id;
  return new;
end $$;

drop trigger if exists trg_after_redemption_insert on public.redemptions;
create trigger trg_after_redemption_insert after insert on public.redemptions
  for each row execute function public.after_redemption_insert();

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

-- =================== PROMOVER 1º ADMIN (correr 1x) ===================
-- 1) Faça signup normal na app com o email do admin.
-- 2) Depois execute (substituindo o email):
--
-- insert into public.user_roles (user_id, role)
-- select id, 'admin' from auth.users where email = 'admin@kubasile.mz'
-- on conflict do nothing;
--
-- delete from public.user_roles
--  where user_id = (select id from auth.users where email='admin@kubasile.mz')
--    and role = 'citizen';
--
-- Para promover operador, use 'operator' em vez de 'admin'.

-- ============================================================
-- Schema: один пользователь, одна анкета, хранится как JSONB.
-- Запусти этот файл в Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- ============================================================

-- Таблица профиля. Одна строка с id='default', данные в JSONB.
create table if not exists public.profile (
  id text primary key default 'default',
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Автообновление updated_at при каждом update.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profile_updated_at on public.profile;
create trigger trg_profile_updated_at
  before update on public.profile
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.profile enable row level security;

-- Любой может читать (это публичные данные портфолио).
drop policy if exists "anyone reads profile" on public.profile;
create policy "anyone reads profile"
  on public.profile for select
  to anon, authenticated
  using (true);

-- Только залогиненный пользователь может писать/обновлять.
drop policy if exists "auth updates profile" on public.profile;
create policy "auth updates profile"
  on public.profile for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "auth inserts profile" on public.profile;
create policy "auth inserts profile"
  on public.profile for insert
  to authenticated
  with check (true);

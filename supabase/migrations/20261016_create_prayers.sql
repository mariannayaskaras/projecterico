create table if not exists public.prayers (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  category text not null default '',
  verse text not null default '',
  reference text not null default '',
  content text not null check (char_length(content) between 1 and 50000),
  day_number smallint unique check (day_number between 1 and 365),
  reading_minutes smallint not null default 5 check (reading_minutes between 1 and 120),
  sort_order integer not null default 0 check (sort_order between 0 and 999999),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prayers_public_order_idx
  on public.prayers (published, sort_order, title);

alter table public.prayers enable row level security;

drop policy if exists "Anyone can read published prayers" on public.prayers;
create policy "Anyone can read published prayers"
  on public.prayers
  for select
  to anon, authenticated
  using (published = true);

revoke insert, update, delete, truncate, references, trigger on public.prayers from anon, authenticated;
grant select on public.prayers to anon, authenticated;
grant all privileges on public.prayers to service_role;

create or replace function public.set_prayers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prayers_updated_at on public.prayers;
create trigger prayers_updated_at
  before update on public.prayers
  for each row execute function public.set_prayers_updated_at();

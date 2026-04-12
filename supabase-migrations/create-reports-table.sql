-- Reports table
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  reason      text not null,
  shop_id     uuid references public.shops(id) on delete set null,
  product_id  uuid references public.products(id) on delete set null,
  message     text not null,
  media_urls  text[] default '{}',
  status      text not null default 'delivered'
                check (status in ('delivered','reviewing','resolved','dismissed')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- RLS
alter table public.reports enable row level security;

-- Users can read their own reports
create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = user_id);

-- Users can insert their own reports
create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

-- Admins can read all reports (via service role or admin check)
create policy "Admins can view all reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role in ('super_admin','platform_admin','operations_admin')
    )
  );

-- Admins can update report status
create policy "Admins can update reports"
  on public.reports for update
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role in ('super_admin','platform_admin','operations_admin')
    )
  );

-- Index for fast user lookups
create index if not exists reports_user_id_idx on public.reports(user_id);
create index if not exists reports_status_idx  on public.reports(status);

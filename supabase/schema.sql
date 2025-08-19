-- Create tenants table
create table if not exists public.tenants (
  id uuid default gen_random_uuid() primary key,
  owner_user_id uuid references auth.users(id) on delete cascade not null,
  slug text unique not null,
  ghl_webhook_url text not null,
  default_tag text,
  created_at timestamptz default now(),
  
  constraint slug_format check (slug ~ '^[a-z0-9-]{3,20}$')
);

-- Create intakes table
create table if not exists public.intakes (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  payload jsonb not null,
  duration_sec integer,
  status text not null default 'sent',
  created_at timestamptz default now(),
  
  constraint status_check check (status in ('sent', 'error'))
);

-- Enable RLS on tables
alter table public.tenants enable row level security;
alter table public.intakes enable row level security;

-- RLS Policies for tenants
create policy "Users can select their own tenant"
  on public.tenants for select
  using (auth.uid() = owner_user_id);

create policy "Users can update their own tenant"
  on public.tenants for update
  using (auth.uid() = owner_user_id);

create policy "Users can insert their own tenant"
  on public.tenants for insert
  with check (auth.uid() = owner_user_id);

-- RLS Policies for intakes
create policy "Users can select intakes for their tenant"
  on public.intakes for select
  using (
    tenant_id in (
      select id from public.tenants where owner_user_id = auth.uid()
    )
  );

create policy "Service role can insert intakes"
  on public.intakes for insert
  with check (true);

-- Indexes for performance
create index if not exists idx_tenants_owner_user_id on public.tenants(owner_user_id);
create index if not exists idx_tenants_slug on public.tenants(slug);
create index if not exists idx_intakes_tenant_id on public.intakes(tenant_id);
create index if not exists idx_intakes_created_at on public.intakes(created_at desc);
-- Optional extension: run after schema.sql. Keep service-role operations server-side.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 role text not null default 'viewer' check (role in ('admin','shipper','transporter','receiver','viewer')),
 created_at timestamptz not null default now()
);
create table if not exists public.audit_events (
 id uuid primary key default gen_random_uuid(),
 shipment_id uuid references public.shipments(id) on delete set null,
 event_type text not null,
 actor_id uuid references auth.users(id) on delete set null,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.audit_events enable row level security;
revoke all on public.profiles from anon, authenticated;
revoke all on public.audit_events from anon, authenticated;

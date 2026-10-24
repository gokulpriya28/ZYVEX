-- Zyvex ColdChain Ledger schema. Run in Supabase Dashboard -> SQL Editor.
-- Server routes use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. Never expose that key in browser code.
create extension if not exists pgcrypto;

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  shipment_code text not null unique,
  product text not null,
  origin text not null,
  destination text not null,
  status text not null default 'In transit' check (status in ('Planned','In transit','Delivered','On hold')),
  min_temp numeric(6,2) not null,
  max_temp numeric(6,2) not null,
  latest_temp numeric(6,2),
  last_seen timestamptz,
  created_at timestamptz not null default now(),
  constraint valid_temperature_range check (min_temp < max_temp)
);
create table if not exists public.temperature_readings (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  temperature numeric(6,2) not null,
  recorded_at timestamptz not null default now(),
  device_id text not null,
  integrity_hash text not null,
  signature text not null,
  simulated boolean not null default true
);
create index if not exists temperature_readings_shipment_time_idx on public.temperature_readings(shipment_id, recorded_at desc);
create table if not exists public.temperature_alerts (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  severity text not null default 'critical' check (severity in ('info','warning','critical')),
  message text not null,
  temperature numeric(6,2) not null,
  created_at timestamptz not null default now(),
  resolved boolean not null default false
);
create index if not exists temperature_alerts_open_idx on public.temperature_alerts(resolved, created_at desc);
create table if not exists public.blockchain_anchors (
  id uuid primary key default gen_random_uuid(),
  batch_hash text not null unique,
  chain_id bigint not null,
  contract_address text not null,
  transaction_hash text not null,
  anchored_by text,
  anchored_at timestamptz not null default now()
);

-- Deny direct anonymous access. The Next.js server API uses the service role key.
alter table public.shipments enable row level security;
alter table public.temperature_readings enable row level security;
alter table public.temperature_alerts enable row level security;
alter table public.blockchain_anchors enable row level security;
revoke all on public.shipments from anon, authenticated;
revoke all on public.temperature_readings from anon, authenticated;
revoke all on public.temperature_alerts from anon, authenticated;
revoke all on public.blockchain_anchors from anon, authenticated;

-- Demo seed data. Run once; shipment codes are unique so rerunning is safe.
insert into public.shipments (shipment_code,product,origin,destination,status,min_temp,max_temp)
values
 ('ZYX-24081','Insulin · refrigerated','Chennai, TN','Coimbatore, TN','In transit',2,8),
 ('ZYX-24082','Vaccine batch V-19','Bengaluru, KA','Salem, TN','In transit',2,8),
 ('ZYX-24083','Dairy samples','Erode, TN','Chennai, TN','Delivered',0,6)
on conflict (shipment_code) do nothing;

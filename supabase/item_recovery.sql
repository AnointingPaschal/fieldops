-- Track item-level recovery for Pick Up / Tear Down tasks
create table if not exists public.task_item_recovery (
  id                 uuid primary key default gen_random_uuid(),
  task_id            uuid not null references public.tasks on delete cascade,
  item_id            uuid not null references public.inventory_items,
  quantity_assigned  integer not null default 0,
  quantity_recovered integer not null default 0,
  quantity_damaged   integer not null default 0,
  quantity_missing   integer not null default 0,
  notes              text,
  created_at         timestamptz default now(),
  unique (task_id, item_id)
);
alter table public.task_item_recovery enable row level security;
create policy "Auth users CRUD task_item_recovery"
  on public.task_item_recovery for all using (auth.role() = 'authenticated');

-- Report schedule configuration
create table if not exists public.report_schedules (
  id                uuid primary key default gen_random_uuid(),
  frequency_value   integer  not null default 1,
  frequency_unit    text     not null default 'weeks'
                    check (frequency_unit in ('hours','days','weeks')),
  recipients        text[]   not null default '{}',
  enabled           boolean  not null default true,
  last_sent_at      timestamptz,
  next_send_at      timestamptz,
  created_by        uuid references public.profiles,
  updated_at        timestamptz not null default now()
);
alter table public.report_schedules enable row level security;
create policy "Supervisors manage report schedules"
  on public.report_schedules for all using (auth.role() = 'authenticated');

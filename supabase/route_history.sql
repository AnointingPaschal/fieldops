-- Store every GPS point for route playback
create table if not exists public.location_history (
  id          uuid primary key default gen_random_uuid(),
  worker_id   uuid not null references public.profiles,
  task_id     uuid references public.tasks,
  lat         double precision not null,
  lng         double precision not null,
  recorded_at timestamptz not null default now()
);
alter table public.location_history enable row level security;
create policy "Auth users can CRUD location_history"
  on public.location_history for all using (auth.role() = 'authenticated');
create index on public.location_history (worker_id, recorded_at desc);
create index on public.location_history (task_id, recorded_at asc);

-- Enable realtime
alter publication supabase_realtime add table public.location_history;

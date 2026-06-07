-- Add location columns to profiles
alter table public.profiles
  add column if not exists lat  double precision,
  add column if not exists lng  double precision,
  add column if not exists location_updated_at timestamptz;

-- Task updates: notes, photos, issues, status changes
create table if not exists public.task_updates (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks on delete cascade,
  worker_id   uuid not null references public.profiles,
  type        text not null check (type in ('note','photo','issue','status')),
  content     text,
  photo_url   text,
  created_at  timestamptz not null default now()
);
alter table public.task_updates enable row level security;
create policy "Auth users CRUD task_updates"
  on public.task_updates for all using (auth.role() = 'authenticated');

-- Storage bucket for task photos
insert into storage.buckets (id, name, public)
  values ('task-photos','task-photos', true)
  on conflict (id) do nothing;

create policy "Public read task photos"
  on storage.objects for select using (bucket_id = 'task-photos');

create policy "Auth upload task photos"
  on storage.objects for insert
  with check (bucket_id = 'task-photos' and auth.role() = 'authenticated');

-- Completion GPS on tasks
alter table public.tasks
  add column if not exists completion_lat     double precision,
  add column if not exists completion_lng     double precision,
  add column if not exists completion_address text;

-- GPS coords on task_updates
alter table public.task_updates
  add column if not exists lat double precision,
  add column if not exists lng double precision;

-- Enable real-time on profiles (for live location)
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.tasks;

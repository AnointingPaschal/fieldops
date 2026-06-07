-- ============================================================
-- FieldOps — Alberta Safety Control
-- Supabase Schema  (run this in your Supabase SQL editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── Profiles (extends auth.users) ──────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  name        text        not null,
  role        text        not null check (role in ('supervisor','worker')),
  job_title   text,
  phone       text,
  available   boolean     not null default true,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can read all profiles"
  on public.profiles for select using (auth.role() = 'authenticated');
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ─── Contractors ─────────────────────────────────────────────
create table if not exists public.contractors (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  address      text,
  contact_name text,
  phone        text,
  created_at   timestamptz not null default now()
);
alter table public.contractors enable row level security;
create policy "Authenticated users can CRUD contractors"
  on public.contractors for all using (auth.role() = 'authenticated');

-- ─── Inventory Items ─────────────────────────────────────────
create table if not exists public.inventory_items (
  id              uuid primary key default gen_random_uuid(),
  name            text        not null,
  category        text        not null,
  total_stock     integer     not null default 0,
  available_stock integer     not null default 0,
  unit            text        not null default 'unit',
  barcode         text,
  created_at      timestamptz not null default now()
);
alter table public.inventory_items enable row level security;
create policy "Authenticated users can CRUD inventory"
  on public.inventory_items for all using (auth.role() = 'authenticated');

-- ─── Tasks ───────────────────────────────────────────────────
create table if not exists public.tasks (
  id                uuid primary key default gen_random_uuid(),
  type              text        not null check (type in ('Delivery','Pick Up','Set Up','Tear Down')),
  status            text        not null default 'Pending'
                    check (status in ('Pending','Assigned','Accepted','In Transit','Completed','Cancelled')),
  contractor_id     uuid        references public.contractors,
  rental_start      timestamptz,
  rental_end        timestamptz,
  supervisor_notes  text,
  created_by        uuid        references public.profiles,
  created_at        timestamptz not null default now(),
  completed_at      timestamptz
);
alter table public.tasks enable row level security;
create policy "Authenticated users can CRUD tasks"
  on public.tasks for all using (auth.role() = 'authenticated');

-- ─── Task Assignments (workers on a task) ────────────────────
create table if not exists public.task_assignments (
  task_id    uuid not null references public.tasks on delete cascade,
  worker_id  uuid not null references public.profiles,
  primary key (task_id, worker_id)
);
alter table public.task_assignments enable row level security;
create policy "Authenticated users can CRUD assignments"
  on public.task_assignments for all using (auth.role() = 'authenticated');

-- ─── Task Items ──────────────────────────────────────────────
create table if not exists public.task_items (
  task_id   uuid    not null references public.tasks on delete cascade,
  item_id   uuid    not null references public.inventory_items,
  quantity  integer not null check (quantity > 0),
  primary key (task_id, item_id)
);
alter table public.task_items enable row level security;
create policy "Authenticated users can CRUD task items"
  on public.task_items for all using (auth.role() = 'authenticated');

-- ─── Timesheet Entries ───────────────────────────────────────
create table if not exists public.timesheet_entries (
  id          uuid primary key default gen_random_uuid(),
  worker_id   uuid        not null references public.profiles,
  date        date        not null,
  clock_in    time,
  clock_out   time,
  created_at  timestamptz not null default now(),
  unique (worker_id, date)
);
alter table public.timesheet_entries enable row level security;
create policy "Workers see own timesheets, supervisors see all"
  on public.timesheet_entries for select using (
    auth.uid() = worker_id
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'supervisor')
  );
create policy "Workers can insert/update own timesheet"
  on public.timesheet_entries for insert with check (auth.uid() = worker_id);
create policy "Workers can update own timesheet"
  on public.timesheet_entries for update using (auth.uid() = worker_id);

-- ─── Auto-create profile on signup ───────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, role, job_title)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'worker'),
    new.raw_user_meta_data->>'job_title'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

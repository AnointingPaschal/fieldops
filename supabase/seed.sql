-- ============================================================
-- FieldOps — Alberta Safety Control
-- Test Data Seed Script
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- Password for all users: FieldOps2026!
-- ============================================================

-- Enable pgcrypto (needed for crypt function)
create extension if not exists pgcrypto;

-- ─── Step 1: Create auth users ───────────────────────────────
-- This creates users directly in Supabase auth
-- The trigger will auto-create their profiles

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin,
  created_at,
  updated_at
) values

-- Supervisor
(
  'a1b2c3d4-0001-0001-0001-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'justin.okeke@albertasafety.ca',
  crypt('FieldOps2026!', gen_salt('bf')),
  now(),
  '{"name":"Justin Okeke","role":"supervisor","job_title":"Operations Supervisor"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false, now(), now()
),

-- Workers
(
  'a1b2c3d4-0002-0002-0002-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'marcus.reid@albertasafety.ca',
  crypt('FieldOps2026!', gen_salt('bf')),
  now(),
  '{"name":"Marcus Reid","role":"worker","job_title":"Field Technician"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false, now(), now()
),
(
  'a1b2c3d4-0003-0003-0003-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'kayla.thompson@albertasafety.ca',
  crypt('FieldOps2026!', gen_salt('bf')),
  now(),
  '{"name":"Kayla Thompson","role":"worker","job_title":"Equipment Specialist"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false, now(), now()
),
(
  'a1b2c3d4-0004-0004-0004-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'devon.clarke@albertasafety.ca',
  crypt('FieldOps2026!', gen_salt('bf')),
  now(),
  '{"name":"Devon Clarke","role":"worker","job_title":"Field Technician"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false, now(), now()
),
(
  'a1b2c3d4-0005-0005-0005-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'priya.nair@albertasafety.ca',
  crypt('FieldOps2026!', gen_salt('bf')),
  now(),
  '{"name":"Priya Nair","role":"worker","job_title":"Senior Field Technician"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false, now(), now()
),
(
  'a1b2c3d4-0006-0006-0006-000000000006',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'ryan.okafor@albertasafety.ca',
  crypt('FieldOps2026!', gen_salt('bf')),
  now(),
  '{"name":"Ryan Okafor","role":"worker","job_title":"Equipment Specialist"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false, now(), now()
);


-- ─── Step 2: Update profiles (trigger already ran) ───────────
-- Patch phone numbers and availability — trigger created the rows

update public.profiles set
  phone = '+1 (587) 968-3707', available = true
where id = 'a1b2c3d4-0001-0001-0001-000000000001';

update public.profiles set
  phone = '+1 (587) 234-5678', available = true
where id = 'a1b2c3d4-0002-0002-0002-000000000002';

update public.profiles set
  phone = '+1 (587) 345-6789', available = true
where id = 'a1b2c3d4-0003-0003-0003-000000000003';

update public.profiles set
  phone = '+1 (587) 456-7890', available = false  -- off today
where id = 'a1b2c3d4-0004-0004-0004-000000000004';

update public.profiles set
  phone = '+1 (587) 567-8901', available = true
where id = 'a1b2c3d4-0005-0005-0005-000000000005';

update public.profiles set
  phone = '+1 (587) 678-9012', available = false  -- off today
where id = 'a1b2c3d4-0006-0006-0006-000000000006';


-- ─── Step 3: Contractors ─────────────────────────────────────

insert into public.contractors (id, name, address, contact_name, phone) values

(
  'c0000001-0000-0000-0000-000000000001',
  'ATCO Electric Ltd.',
  '5302 Forand St SW, Calgary, AB  T3E 8B4',
  'Greg Linden',
  '+1 (403) 292-7500'
),
(
  'c0000001-0000-0000-0000-000000000002',
  'Graham Construction',
  '2520 Quesnay Wood Dr SW, Calgary, AB  T3E 7J5',
  'Sandra Wu',
  '+1 (403) 685-4000'
),
(
  'c0000001-0000-0000-0000-000000000003',
  'Bird Construction Inc.',
  '4810 93 St NW, Edmonton, AB  T6E 5M4',
  'Tom Fleming',
  '+1 (780) 469-3338'
),
(
  'c0000001-0000-0000-0000-000000000004',
  'Ledcor Group',
  '1067 West Cordova St, Calgary, AB  T2P 0L5',
  'Amanda Peralta',
  '+1 (403) 215-4040'
);


-- ─── Step 4: Inventory ───────────────────────────────────────

insert into public.inventory_items (id, name, category, total_stock, available_stock, unit, barcode) values

-- Signage
('i000001', 'Arrow Board (Trailer-Mounted)', 'Signage',         12,  9,  'unit',  '789-ASC-0001'),
('i000002', 'Road Closed Sign (48x48)',      'Signage',         20,  20, 'unit',  '789-ASC-0002'),
('i000003', 'Portable Variable Speed Sign',  'Signage',          8,  5,  'unit',  '789-ASC-0003'),
('i000004', 'Regulatory Sign — No Entry',    'Signage',         15,  15, 'unit',  '789-ASC-0004'),
('i000005', 'Construction Ahead Sign',       'Signage',         25,  22, 'unit',  '789-ASC-0005'),

-- Traffic Control
('i000006', 'Traffic Cone (36 inch)',        'Traffic Control', 200, 147,'cone',  '789-ASC-0006'),
('i000007', 'Channelizer Drum',              'Traffic Control',  80,  55, 'unit',  '789-ASC-0007'),
('i000008', 'LED Stop/Slow Paddle',          'Traffic Control',  30,  22, 'unit',  '789-ASC-0008'),
('i000009', 'Truck-Mounted Attenuator (TMA)','Traffic Control',   4,   3, 'unit',  '789-ASC-0009'),
('i000010', 'Rumble Strip (Portable)',        'Traffic Control',  16,  12, 'strip', '789-ASC-0010'),

-- Barricades
('i000011', 'Type III Barricade (8 ft)',     'Barricades',       40,  28, 'unit',  '789-ASC-0011'),
('i000012', 'Water-Filled Barrier (jersey)', 'Barricades',       25,  18, 'unit',  '789-ASC-0012'),
('i000013', 'Pedestrian Barrier (interlocking)','Barricades',    60,  45, 'unit',  '789-ASC-0013'),

-- Lighting
('i000014', 'Barricade Light (LED, amber)',  'Lighting',         60,  44, 'unit',  '789-ASC-0014'),
('i000015', 'Portable Light Tower (4-head)', 'Lighting',          6,   4, 'unit',  '789-ASC-0015'),

-- PPE
('i000016', 'Reflective Safety Vest (Class 2)','PPE',           100,  78, 'vest',  '789-ASC-0016'),
('i000017', 'Hard Hat (orange)',             'PPE',              50,  43, 'unit',  '789-ASC-0017'),
('i000018', 'Safety Glasses (anti-fog)',     'PPE',              80,  65, 'pair',  '789-ASC-0018');


-- ─── Step 5: Tasks ───────────────────────────────────────────

insert into public.tasks (
  id, type, status, contractor_id,
  rental_start, rental_end,
  supervisor_notes, created_by, created_at, completed_at
) values

-- Task 1: Completed delivery to ATCO
(
  't0000001',
  'Delivery', 'Completed',
  'c0000001-0000-0000-0000-000000000001',
  now() - interval '5 days',
  now() - interval '3 days',
  'Deliver to the north entrance gate. Security checkpoint — ask for Greg Linden. All boards must be assembled before leaving site.',
  'a1b2c3d4-0001-0001-0001-000000000001',
  now() - interval '6 days',
  now() - interval '3 days' + interval '2 hours'
),

-- Task 2: Pick Up in transit — Graham Construction
(
  't0000002',
  'Pick Up', 'In Transit',
  'c0000001-0000-0000-0000-000000000002',
  now() - interval '1 day',
  now() + interval '4 hours',
  'Collect all barricades from the 17th Ave closure site. Sandra Wu will have the inventory checklist. Return items to Warehouse Bay 3.',
  'a1b2c3d4-0001-0001-0001-000000000001',
  now() - interval '2 days',
  null
),

-- Task 3: Set Up assigned — Bird Construction, Highway 2
(
  't0000003',
  'Set Up', 'Assigned',
  'c0000001-0000-0000-0000-000000000003',
  now() + interval '1 day',
  now() + interval '4 days',
  'Highway 2 northbound — full lane closure between Hwy 2 and Hwy 2A near Airdrie. WCB observer on site from 7 AM. Set up per AB-approved TMP, drawing #TMP-2026-0441.',
  'a1b2c3d4-0001-0001-0001-000000000001',
  now() - interval '1 day',
  null
),

-- Task 4: Tear Down pending — ATCO
(
  't0000004',
  'Tear Down', 'Pending',
  'c0000001-0000-0000-0000-000000000001',
  now() + interval '2 days',
  now() + interval '2 days' + interval '6 hours',
  'Evening teardown after the Macleod Trail paving is complete. Confirm with Greg that paving crew is done before starting. All equipment back to yard by 10 PM.',
  'a1b2c3d4-0001-0001-0001-000000000001',
  now() - interval '12 hours',
  null
),

-- Task 5: Delivery — Accepted, Ledcor
(
  't0000005',
  'Delivery', 'Accepted',
  'c0000001-0000-0000-0000-000000000004',
  now(),
  now() + interval '6 hours',
  'Deliver speed signs and cones to the Memorial Drive resurfacing project. Site foreman is Amanda Peralta. Call 15 minutes before arrival.',
  'a1b2c3d4-0001-0001-0001-000000000001',
  now() - interval '3 hours',
  null
),

-- Task 6: Completed Set Up — Graham Construction
(
  't0000006',
  'Set Up', 'Completed',
  'c0000001-0000-0000-0000-000000000002',
  now() - interval '8 days',
  now() - interval '5 days',
  '4th Ave pedestrian detour for downtown utility work. Set per City of Calgary Standard Drawing 2025-UTL-04.',
  'a1b2c3d4-0001-0001-0001-000000000001',
  now() - interval '9 days',
  now() - interval '5 days' + interval '3 hours'
);


-- ─── Step 6: Task Assignments (workers on tasks) ──────────────

insert into public.task_assignments (task_id, worker_id) values

-- Task 1 (Completed delivery) — Marcus
('t0000001', 'a1b2c3d4-0002-0002-0002-000000000002'),

-- Task 2 (Pick Up, in transit) — Kayla
('t0000002', 'a1b2c3d4-0003-0003-0003-000000000003'),

-- Task 3 (Set Up, assigned) — Marcus + Priya
('t0000003', 'a1b2c3d4-0002-0002-0002-000000000002'),
('t0000003', 'a1b2c3d4-0005-0005-0005-000000000005'),

-- Task 4 (Tear Down, pending) — Kayla
('t0000004', 'a1b2c3d4-0003-0003-0003-000000000003'),

-- Task 5 (Delivery, accepted) — Priya
('t0000005', 'a1b2c3d4-0005-0005-0005-000000000005'),

-- Task 6 (Completed Set Up) — Marcus + Kayla
('t0000006', 'a1b2c3d4-0002-0002-0002-000000000002'),
('t0000006', 'a1b2c3d4-0003-0003-0003-000000000003');


-- ─── Step 7: Task Items ──────────────────────────────────────

insert into public.task_items (task_id, item_id, quantity) values

-- Task 1: Arrow board + cones
('t0000001', 'i000001', 2),
('t0000001', 'i000006', 30),
('t0000001', 'i000014', 10),

-- Task 2: Barricades pickup
('t0000002', 'i000011', 8),
('t0000002', 'i000012', 4),
('t0000002', 'i000014', 12),

-- Task 3: Highway set up (full kit)
('t0000003', 'i000001', 2),
('t0000003', 'i000003', 2),
('t0000003', 'i000006', 40),
('t0000003', 'i000007', 15),
('t0000003', 'i000011', 10),
('t0000003', 'i000015', 2),

-- Task 4: Tear down (returning)
('t0000004', 'i000001', 1),
('t0000004', 'i000006', 25),
('t0000004', 'i000014', 8),

-- Task 5: Speed signs + cones
('t0000005', 'i000003', 2),
('t0000005', 'i000005', 4),
('t0000005', 'i000006', 20),

-- Task 6: Pedestrian set up (completed)
('t0000006', 'i000013', 20),
('t0000006', 'i000008', 4),
('t0000006', 'i000014', 6);


-- ─── Step 8: Timesheet entries (past 2 weeks) ────────────────
-- Marcus Reid & Kayla Thompson (active workers)

insert into public.timesheet_entries (id, worker_id, date, clock_in, clock_out) values

-- Marcus Reid — week 1
('ts000001', 'a1b2c3d4-0002-0002-0002-000000000002', current_date - 11, '07:02', '17:15'),
('ts000002', 'a1b2c3d4-0002-0002-0002-000000000002', current_date - 10, '06:58', '15:30'),
('ts000003', 'a1b2c3d4-0002-0002-0002-000000000002', current_date - 9,  '07:00', '16:00'),
('ts000004', 'a1b2c3d4-0002-0002-0002-000000000002', current_date - 8,  '07:05', '15:45'),
('ts000005', 'a1b2c3d4-0002-0002-0002-000000000002', current_date - 7,  '06:55', '17:00'),

-- Marcus Reid — week 2 (current week)
('ts000006', 'a1b2c3d4-0002-0002-0002-000000000002', current_date - 4,  '07:10', '17:30'),
('ts000007', 'a1b2c3d4-0002-0002-0002-000000000002', current_date - 3,  '06:50', '16:15'),
('ts000008', 'a1b2c3d4-0002-0002-0002-000000000002', current_date - 2,  '07:00', '15:45'),
('ts000009', 'a1b2c3d4-0002-0002-0002-000000000002', current_date - 1,  '07:03', '17:00'),
('ts000010', 'a1b2c3d4-0002-0002-0002-000000000002', current_date,      '07:01', null),  -- clocked in today, still on shift

-- Kayla Thompson — week 1
('ts000011', 'a1b2c3d4-0003-0003-0003-000000000003', current_date - 11, '08:00', '16:30'),
('ts000012', 'a1b2c3d4-0003-0003-0003-000000000003', current_date - 10, '07:45', '17:00'),
('ts000013', 'a1b2c3d4-0003-0003-0003-000000000003', current_date - 9,  '07:55', '18:00'),
('ts000014', 'a1b2c3d4-0003-0003-0003-000000000003', current_date - 8,  '08:00', '16:00'),
('ts000015', 'a1b2c3d4-0003-0003-0003-000000000003', current_date - 7,  '07:50', '17:30'),

-- Kayla Thompson — week 2 (current week)
('ts000016', 'a1b2c3d4-0003-0003-0003-000000000003', current_date - 4,  '07:58', '17:15'),
('ts000017', 'a1b2c3d4-0003-0003-0003-000000000003', current_date - 3,  '08:00', '16:30'),
('ts000018', 'a1b2c3d4-0003-0003-0003-000000000003', current_date - 2,  '07:45', '17:45'),
('ts000019', 'a1b2c3d4-0003-0003-0003-000000000003', current_date - 1,  '08:00', '16:00'),

-- Priya Nair — current week
('ts000020', 'a1b2c3d4-0005-0005-0005-000000000005', current_date - 4,  '06:45', '15:00'),
('ts000021', 'a1b2c3d4-0005-0005-0005-000000000005', current_date - 3,  '07:00', '16:30'),
('ts000022', 'a1b2c3d4-0005-0005-0005-000000000005', current_date - 2,  '07:00', '17:00'),
('ts000023', 'a1b2c3d4-0005-0005-0005-000000000005', current_date - 1,  '06:55', '16:45');


-- ─── Step 9: Fix available_stock to reflect items out on tasks ──
-- Subtract quantities that are currently deployed (non-completed tasks)

-- Arrow Boards out: task3(2) + task5(0) + task4(1) = 3
update public.inventory_items set available_stock = total_stock - 3 where id = 'i000001';

-- Traffic Cones out: task3(40) + task4(25) + task5(20) = 85, but we set 147 already, adjust
update public.inventory_items set available_stock = 115 where id = 'i000006';

-- Channelizer Drums out: task3(15)
update public.inventory_items set available_stock = 65 where id = 'i000007';

-- Barricade Lights out: task2(12) + task4(8) = 20
update public.inventory_items set available_stock = 40 where id = 'i000014';

-- Type III Barricades out: task2(8) + task3(10) = 18 (task1 completed so returned)
update public.inventory_items set available_stock = 22 where id = 'i000011';

-- Water-Filled Barriers out: task2(4)
update public.inventory_items set available_stock = 21 where id = 'i000012';

-- Variable Speed Signs out: task3(2) + task5(2) = 4
update public.inventory_items set available_stock = 4 where id = 'i000003';

-- Light Towers out: task3(2)
update public.inventory_items set available_stock = 4 where id = 'i000015';


-- ─── Done ─────────────────────────────────────────────────────
-- Verify with:
-- select count(*) from auth.users;           → 6
-- select count(*) from public.profiles;      → 6
-- select count(*) from public.contractors;   → 4
-- select count(*) from public.inventory_items; → 18
-- select count(*) from public.tasks;         → 6
-- select count(*) from public.task_assignments; → 8
-- select count(*) from public.task_items;    → 19
-- select count(*) from public.timesheet_entries; → 23

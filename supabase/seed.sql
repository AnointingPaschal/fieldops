-- ============================================================
-- FieldOps — Alberta Safety Control
-- Test Data Seed Script  (run AFTER schema.sql)
-- Password for all accounts: FieldOps2026!
-- ============================================================

create extension if not exists pgcrypto;

-- ─── 1. Auth users ───────────────────────────────────────────

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
  is_super_admin, created_at, updated_at
) values

(
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'justin.okeke@albertasafety.ca',
  crypt('FieldOps2026!', gen_salt('bf')),
  now(),
  '{"name":"Justin Okeke","role":"supervisor","job_title":"Operations Supervisor"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false, now(), now()
),
(
  '00000000-0000-0000-0002-000000000002',
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
  '00000000-0000-0000-0003-000000000003',
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
  '00000000-0000-0000-0004-000000000004',
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
  '00000000-0000-0000-0005-000000000005',
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
  '00000000-0000-0000-0006-000000000006',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'ryan.okafor@albertasafety.ca',
  crypt('FieldOps2026!', gen_salt('bf')),
  now(),
  '{"name":"Ryan Okafor","role":"worker","job_title":"Equipment Specialist"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  false, now(), now()
);


-- ─── 2. Patch profiles (trigger auto-created them) ───────────

update public.profiles set phone = '+1 (587) 968-3707', available = true
  where id = '00000000-0000-0000-0001-000000000001';

update public.profiles set phone = '+1 (587) 234-5678', available = true
  where id = '00000000-0000-0000-0002-000000000002';

update public.profiles set phone = '+1 (587) 345-6789', available = true
  where id = '00000000-0000-0000-0003-000000000003';

update public.profiles set phone = '+1 (587) 456-7890', available = false
  where id = '00000000-0000-0000-0004-000000000004';

update public.profiles set phone = '+1 (587) 567-8901', available = true
  where id = '00000000-0000-0000-0005-000000000005';

update public.profiles set phone = '+1 (587) 678-9012', available = false
  where id = '00000000-0000-0000-0006-000000000006';


-- ─── 3. Contractors ──────────────────────────────────────────

insert into public.contractors (id, name, address, contact_name, phone) values

(
  'c0000000-0000-0000-0000-000000000001',
  'ATCO Electric Ltd.',
  '5302 Forand St SW, Calgary, AB  T3E 8B4',
  'Greg Linden',
  '+1 (403) 292-7500'
),
(
  'c0000000-0000-0000-0000-000000000002',
  'Graham Construction',
  '2520 Quesnay Wood Dr SW, Calgary, AB  T3E 7J5',
  'Sandra Wu',
  '+1 (403) 685-4000'
),
(
  'c0000000-0000-0000-0000-000000000003',
  'Bird Construction Inc.',
  '4810 93 St NW, Edmonton, AB  T6E 5M4',
  'Tom Fleming',
  '+1 (780) 469-3338'
),
(
  'c0000000-0000-0000-0000-000000000004',
  'Ledcor Group',
  '1067 West Cordova St, Calgary, AB  T2P 0L5',
  'Amanda Peralta',
  '+1 (403) 215-4040'
);


-- ─── 4. Inventory ────────────────────────────────────────────

insert into public.inventory_items (id, name, category, total_stock, available_stock, unit, barcode) values

-- Signage
('aa000000-0000-0000-0000-000000000001', 'Arrow Board (Trailer-Mounted)',   'Signage',          12,   9, 'unit',  '789-ASC-0001'),
('aa000000-0000-0000-0000-000000000002', 'Road Closed Sign (48x48)',         'Signage',          20,  20, 'unit',  '789-ASC-0002'),
('aa000000-0000-0000-0000-000000000003', 'Portable Variable Speed Sign',     'Signage',           8,   4, 'unit',  '789-ASC-0003'),
('aa000000-0000-0000-0000-000000000004', 'No Entry Regulatory Sign',         'Signage',          15,  15, 'unit',  '789-ASC-0004'),
('aa000000-0000-0000-0000-000000000005', 'Construction Ahead Sign',          'Signage',          25,  22, 'unit',  '789-ASC-0005'),

-- Traffic Control
('aa000000-0000-0000-0000-000000000006', 'Traffic Cone (36 inch)',           'Traffic Control', 200, 115, 'cone',  '789-ASC-0006'),
('aa000000-0000-0000-0000-000000000007', 'Channelizer Drum',                 'Traffic Control',  80,  65, 'unit',  '789-ASC-0007'),
('aa000000-0000-0000-0000-000000000008', 'LED Stop/Slow Paddle',             'Traffic Control',  30,  22, 'unit',  '789-ASC-0008'),
('aa000000-0000-0000-0000-000000000009', 'Truck-Mounted Attenuator (TMA)',   'Traffic Control',   4,   3, 'unit',  '789-ASC-0009'),
('aa000000-0000-0000-0000-000000000010', 'Portable Rumble Strip',            'Traffic Control',  16,  12, 'strip', '789-ASC-0010'),

-- Barricades
('aa000000-0000-0000-0000-000000000011', 'Type III Barricade (8 ft)',        'Barricades',       40,  22, 'unit',  '789-ASC-0011'),
('aa000000-0000-0000-0000-000000000012', 'Water-Filled Jersey Barrier',      'Barricades',       25,  21, 'unit',  '789-ASC-0012'),
('aa000000-0000-0000-0000-000000000013', 'Pedestrian Interlocking Barrier',  'Barricades',       60,  40, 'unit',  '789-ASC-0013'),

-- Lighting
('aa000000-0000-0000-0000-000000000014', 'Barricade Light (LED Amber)',      'Lighting',         60,  40, 'unit',  '789-ASC-0014'),
('aa000000-0000-0000-0000-000000000015', 'Portable Light Tower (4-head)',    'Lighting',          6,   4, 'unit',  '789-ASC-0015'),

-- PPE
('aa000000-0000-0000-0000-000000000016', 'Reflective Safety Vest (Class 2)', 'PPE',             100,  78, 'vest',  '789-ASC-0016'),
('aa000000-0000-0000-0000-000000000017', 'Hard Hat (orange)',                'PPE',              50,  43, 'unit',  '789-ASC-0017'),
('aa000000-0000-0000-0000-000000000018', 'Safety Glasses (anti-fog)',        'PPE',              80,  65, 'pair',  '789-ASC-0018');


-- ─── 5. Tasks ────────────────────────────────────────────────

insert into public.tasks (
  id, type, status, contractor_id,
  rental_start, rental_end,
  supervisor_notes, created_by, created_at, completed_at
) values

(
  'bb000000-0000-0000-0000-000000000001',
  'Delivery', 'Completed',
  'c0000000-0000-0000-0000-000000000001',
  now() - interval '5 days',
  now() - interval '3 days',
  'Deliver to north entrance gate. Security checkpoint — ask for Greg Linden. All boards must be assembled before leaving site.',
  '00000000-0000-0000-0001-000000000001',
  now() - interval '6 days',
  now() - interval '3 days' + interval '2 hours'
),
(
  'bb000000-0000-0000-0000-000000000002',
  'Pick Up', 'In Transit',
  'c0000000-0000-0000-0000-000000000002',
  now() - interval '1 day',
  now() + interval '4 hours',
  'Collect all barricades from the 17th Ave closure site. Sandra Wu will have the inventory checklist. Return items to Warehouse Bay 3.',
  '00000000-0000-0000-0001-000000000001',
  now() - interval '2 days',
  null
),
(
  'bb000000-0000-0000-0000-000000000003',
  'Set Up', 'Assigned',
  'c0000000-0000-0000-0000-000000000003',
  now() + interval '1 day',
  now() + interval '4 days',
  'Highway 2 northbound — full lane closure between Hwy 2 and Hwy 2A near Airdrie. WCB observer on site from 7 AM. Set up per AB-approved TMP drawing #TMP-2026-0441.',
  '00000000-0000-0000-0001-000000000001',
  now() - interval '1 day',
  null
),
(
  'bb000000-0000-0000-0000-000000000004',
  'Tear Down', 'Pending',
  'c0000000-0000-0000-0000-000000000001',
  now() + interval '2 days',
  now() + interval '2 days' + interval '6 hours',
  'Evening teardown after Macleod Trail paving is complete. Confirm with Greg that paving crew is done before starting. All equipment back to yard by 10 PM.',
  '00000000-0000-0000-0001-000000000001',
  now() - interval '12 hours',
  null
),
(
  'bb000000-0000-0000-0000-000000000005',
  'Delivery', 'Accepted',
  'c0000000-0000-0000-0000-000000000004',
  now(),
  now() + interval '6 hours',
  'Deliver speed signs and cones to the Memorial Drive resurfacing project. Site foreman is Amanda Peralta. Call 15 minutes before arrival.',
  '00000000-0000-0000-0001-000000000001',
  now() - interval '3 hours',
  null
),
(
  'bb000000-0000-0000-0000-000000000006',
  'Set Up', 'Completed',
  'c0000000-0000-0000-0000-000000000002',
  now() - interval '8 days',
  now() - interval '5 days',
  '4th Ave pedestrian detour for downtown utility work. Set per City of Calgary Standard Drawing 2025-UTL-04.',
  '00000000-0000-0000-0001-000000000001',
  now() - interval '9 days',
  now() - interval '5 days' + interval '3 hours'
);


-- ─── 6. Task assignments ─────────────────────────────────────

insert into public.task_assignments (task_id, worker_id) values

('bb000000-0000-0000-0000-000000000001', '00000000-0000-0000-0002-000000000002'),

('bb000000-0000-0000-0000-000000000002', '00000000-0000-0000-0003-000000000003'),

('bb000000-0000-0000-0000-000000000003', '00000000-0000-0000-0002-000000000002'),
('bb000000-0000-0000-0000-000000000003', '00000000-0000-0000-0005-000000000005'),

('bb000000-0000-0000-0000-000000000004', '00000000-0000-0000-0003-000000000003'),

('bb000000-0000-0000-0000-000000000005', '00000000-0000-0000-0005-000000000005'),

('bb000000-0000-0000-0000-000000000006', '00000000-0000-0000-0002-000000000002'),
('bb000000-0000-0000-0000-000000000006', '00000000-0000-0000-0003-000000000003');


-- ─── 7. Task items ───────────────────────────────────────────

insert into public.task_items (task_id, item_id, quantity) values

-- Task 1 completed delivery
('bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 2),
('bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000006', 30),
('bb000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000014', 10),

-- Task 2 pick up in transit
('bb000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000011', 8),
('bb000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000012', 4),
('bb000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000014', 12),

-- Task 3 highway set up
('bb000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000001', 2),
('bb000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000003', 2),
('bb000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000006', 40),
('bb000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000007', 15),
('bb000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000011', 10),
('bb000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000015', 2),

-- Task 4 tear down
('bb000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000001', 1),
('bb000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000006', 25),
('bb000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000014', 8),

-- Task 5 delivery accepted
('bb000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000003', 2),
('bb000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000005', 4),
('bb000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000006', 20),

-- Task 6 completed set up
('bb000000-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000013', 20),
('bb000000-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000008',  4),
('bb000000-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000014',  6);


-- ─── 8. Timesheet entries ────────────────────────────────────

insert into public.timesheet_entries (id, worker_id, date, clock_in, clock_out) values

-- Marcus Reid — last week
('ee000000-0000-0000-0000-000000000001', '00000000-0000-0000-0002-000000000002', current_date - 11, '07:02', '17:15'),
('ee000000-0000-0000-0000-000000000002', '00000000-0000-0000-0002-000000000002', current_date - 10, '06:58', '15:30'),
('ee000000-0000-0000-0000-000000000003', '00000000-0000-0000-0002-000000000002', current_date - 9,  '07:00', '16:00'),
('ee000000-0000-0000-0000-000000000004', '00000000-0000-0000-0002-000000000002', current_date - 8,  '07:05', '15:45'),
('ee000000-0000-0000-0000-000000000005', '00000000-0000-0000-0002-000000000002', current_date - 7,  '06:55', '17:00'),

-- Marcus Reid — this week (clocked in today, not yet out)
('ee000000-0000-0000-0000-000000000006', '00000000-0000-0000-0002-000000000002', current_date - 4,  '07:10', '17:30'),
('ee000000-0000-0000-0000-000000000007', '00000000-0000-0000-0002-000000000002', current_date - 3,  '06:50', '16:15'),
('ee000000-0000-0000-0000-000000000008', '00000000-0000-0000-0002-000000000002', current_date - 2,  '07:00', '15:45'),
('ee000000-0000-0000-0000-000000000009', '00000000-0000-0000-0002-000000000002', current_date - 1,  '07:03', '17:00'),
('ee000000-0000-0000-0000-000000000010', '00000000-0000-0000-0002-000000000002', current_date,      '07:01',  null),

-- Kayla Thompson — last week
('ee000000-0000-0000-0000-000000000011', '00000000-0000-0000-0003-000000000003', current_date - 11, '08:00', '16:30'),
('ee000000-0000-0000-0000-000000000012', '00000000-0000-0000-0003-000000000003', current_date - 10, '07:45', '17:00'),
('ee000000-0000-0000-0000-000000000013', '00000000-0000-0000-0003-000000000003', current_date - 9,  '07:55', '18:00'),
('ee000000-0000-0000-0000-000000000014', '00000000-0000-0000-0003-000000000003', current_date - 8,  '08:00', '16:00'),
('ee000000-0000-0000-0000-000000000015', '00000000-0000-0000-0003-000000000003', current_date - 7,  '07:50', '17:30'),

-- Kayla Thompson — this week
('ee000000-0000-0000-0000-000000000016', '00000000-0000-0000-0003-000000000003', current_date - 4,  '07:58', '17:15'),
('ee000000-0000-0000-0000-000000000017', '00000000-0000-0000-0003-000000000003', current_date - 3,  '08:00', '16:30'),
('ee000000-0000-0000-0000-000000000018', '00000000-0000-0000-0003-000000000003', current_date - 2,  '07:45', '17:45'),
('ee000000-0000-0000-0000-000000000019', '00000000-0000-0000-0003-000000000003', current_date - 1,  '08:00', '16:00'),

-- Priya Nair — this week
('ee000000-0000-0000-0000-000000000020', '00000000-0000-0000-0005-000000000005', current_date - 4,  '06:45', '15:00'),
('ee000000-0000-0000-0000-000000000021', '00000000-0000-0000-0005-000000000005', current_date - 3,  '07:00', '16:30'),
('ee000000-0000-0000-0000-000000000022', '00000000-0000-0000-0005-000000000005', current_date - 2,  '07:00', '17:00'),
('ee000000-0000-0000-0000-000000000023', '00000000-0000-0000-0005-000000000005', current_date - 1,  '06:55', '16:45');


-- ─── Verify ──────────────────────────────────────────────────
-- select count(*) from auth.users;              → 6
-- select count(*) from public.profiles;         → 6
-- select count(*) from public.contractors;      → 4
-- select count(*) from public.inventory_items;  → 18
-- select count(*) from public.tasks;            → 6
-- select count(*) from public.task_assignments; → 8
-- select count(*) from public.task_items;       → 21
-- select count(*) from public.timesheet_entries;→ 23

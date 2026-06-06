export const MOCK_TASKS = [
  {
    id: 't1', type: 'delivery', status: 'in_transit',
    contractor: { name: 'ATCO', address: '5302 Forand St SW, Calgary, AB', contactName: 'Greg Linden', phone: '+1 (403) 292-7500' },
    employees: [{ name: 'Marcus Reid', initials: 'MR', color: '#3B9EFF' }],
    items: [
      { name: 'Arrow Board', qty: 2, unit: 'unit' },
      { name: 'Traffic Cone', qty: 20, unit: 'cone' },
    ],
    rentalStart: '2026-06-06T14:00', rentalEnd: '2026-06-07T16:00',
    notes: 'Deliver to north entrance gate. Ask for Greg.',
  },
  {
    id: 't2', type: 'pickup', status: 'assigned',
    contractor: { name: 'Primany', address: '880 24th Ave SE, Calgary, AB', contactName: 'Sandra Wu', phone: '+1 (403) 555-0199' },
    employees: [{ name: 'Kayla Thompson', initials: 'KT', color: '#22D46E' }],
    items: [
      { name: 'Type III Barricade', qty: 8, unit: 'unit' },
      { name: 'Barricade Light', qty: 12, unit: 'unit' },
    ],
    rentalStart: '2026-06-05T08:00', rentalEnd: '2026-06-06T17:00',
    notes: '',
  },
  {
    id: 't3', type: 'setup', status: 'pending',
    contractor: { name: 'Dunwald & Fleming', address: '2840 2 Ave SE, Calgary, AB', contactName: 'Tom Fleming', phone: '+1 (403) 555-0177' },
    employees: [
      { name: 'Marcus Reid', initials: 'MR', color: '#3B9EFF' },
      { name: 'Priya Nair', initials: 'PN', color: '#C77DFF' },
    ],
    items: [
      { name: 'Channelizer Drum', qty: 15, unit: 'unit' },
      { name: 'Traffic Cone', qty: 30, unit: 'cone' },
    ],
    rentalStart: '2026-06-07T07:00', rentalEnd: '2026-06-10T18:00',
    notes: 'Highway 2 construction zone. Full lane closure setup.',
  },
  {
    id: 't4', type: 'teardown', status: 'completed',
    contractor: { name: 'ATCO', address: '5302 Forand St SW, Calgary, AB', contactName: 'Greg Linden', phone: '+1 (403) 292-7500' },
    employees: [{ name: 'Kayla Thompson', initials: 'KT', color: '#22D46E' }],
    items: [{ name: 'Arrow Board', qty: 1, unit: 'unit' }],
    rentalStart: '2026-06-04T06:00', rentalEnd: '2026-06-06T20:00',
    notes: 'Evening teardown — all items returned to warehouse.',
  },
];

export const MOCK_INVENTORY = [
  { id: 'i1', name: 'Arrow Board', category: 'Signage', total: 12, available: 9, out: 3, unit: 'unit', barcode: '7891234560001' },
  { id: 'i2', name: 'Traffic Cone', category: 'Traffic Control', total: 200, available: 147, out: 53, unit: 'cone', barcode: '7891234560002' },
  { id: 'i3', name: 'Barricade Light', category: 'Lighting', total: 60, available: 44, out: 16, unit: 'unit', barcode: '7891234560003' },
  { id: 'i4', name: 'Type III Barricade', category: 'Barricades', total: 40, available: 28, out: 12, unit: 'unit', barcode: '7891234560004' },
  { id: 'i5', name: 'Road Closed Sign', category: 'Signage', total: 20, available: 20, out: 0, unit: 'unit', barcode: '7891234560005' },
  { id: 'i6', name: 'Channelizer Drum', category: 'Traffic Control', total: 80, available: 55, out: 25, unit: 'unit', barcode: '7891234560006' },
  { id: 'i7', name: 'Variable Speed Sign', category: 'Signage', total: 8, available: 5, out: 3, unit: 'unit', barcode: '7891234560007' },
  { id: 'i8', name: 'LED Stop/Slow Paddle', category: 'Traffic Control', total: 30, available: 22, out: 8, unit: 'unit', barcode: '7891234560008' },
  { id: 'i9', name: 'Reflective Safety Vest', category: 'PPE', total: 100, available: 78, out: 22, unit: 'vest', barcode: '7891234560009' },
  { id: 'i10', name: 'Water-Filled Barrier', category: 'Barricades', total: 25, available: 18, out: 7, unit: 'unit', barcode: '7891234560010' },
];

export const MOCK_WORKERS = [
  { id: 'w1', name: 'Marcus Reid', title: 'Field Technician', initials: 'MR', color: '#3B9EFF', available: true, phone: '+1 (587) 234-5678' },
  { id: 'w2', name: 'Kayla Thompson', title: 'Equipment Specialist', initials: 'KT', color: '#22D46E', available: true, phone: '+1 (587) 345-6789' },
  { id: 'w3', name: 'Devon Clarke', title: 'Field Technician', initials: 'DC', color: '#FF6B35', available: false, phone: '+1 (587) 456-7890' },
  { id: 'w4', name: 'Priya Nair', title: 'Senior Technician', initials: 'PN', color: '#C77DFF', available: true, phone: '+1 (587) 567-8901' },
  { id: 'w5', name: 'Ryan Okafor', title: 'Equipment Specialist', initials: 'RO', color: '#FFB800', available: false, phone: '+1 (587) 678-9012' },
];

export const MOCK_CONTRACTORS = [
  { id: 'c1', name: 'ATCO', address: '5302 Forand St SW, Calgary, AB T3E 8B4', contactName: 'Greg Linden', phone: '+1 (403) 292-7500' },
  { id: 'c2', name: 'Primany', address: '880 24th Ave SE, Calgary, AB T2G 1P1', contactName: 'Sandra Wu', phone: '+1 (403) 555-0199' },
  { id: 'c3', name: 'Dunwald & Fleming', address: '2840 2 Ave SE, Calgary, AB T2A 7X9', contactName: 'Tom Fleming', phone: '+1 (403) 555-0177' },
];

export const MOCK_TIMESHEET = [
  { id: 'ts1', day: 'Monday', date: 'Jun 1', clockIn: '07:02', clockOut: '17:15', hours: 10.22, ot: 2.22, tasks: 1 },
  { id: 'ts2', day: 'Tuesday', date: 'Jun 2', clockIn: '06:58', clockOut: '15:30', hours: 8.53, ot: 0.53, tasks: 0 },
  { id: 'ts3', day: 'Wednesday', date: 'Jun 3', clockIn: '07:00', clockOut: '16:00', hours: 9.00, ot: 1.00, tasks: 1 },
  { id: 'ts4', day: 'Thursday', date: 'Jun 4', clockIn: '07:05', clockOut: '15:45', hours: 8.67, ot: 0.67, tasks: 0 },
  { id: 'ts5', day: 'Friday', date: 'Jun 5', clockIn: '06:55', clockOut: '17:00', hours: 10.08, ot: 2.08, tasks: 1 },
];

export type TaskType = 'delivery' | 'pickup' | 'setup' | 'teardown';
export type TaskStatus = 'pending' | 'assigned' | 'accepted' | 'in_transit' | 'completed' | 'cancelled';

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:    { label: 'Pending',    color: '#8892A4', bg: 'rgba(136,146,164,0.12)', dot: '#8892A4' },
  assigned:   { label: 'Assigned',   color: '#3B9EFF', bg: 'rgba(59,158,255,0.12)',  dot: '#3B9EFF' },
  accepted:   { label: 'Accepted',   color: '#FF6B35', bg: 'rgba(255,107,53,0.12)',  dot: '#FF6B35' },
  in_transit: { label: 'In Transit', color: '#FFB800', bg: 'rgba(255,184,0,0.12)',   dot: '#FFB800' },
  completed:  { label: 'Completed',  color: '#22D46E', bg: 'rgba(34,212,110,0.12)', dot: '#22D46E' },
  cancelled:  { label: 'Cancelled',  color: '#FF3B5C', bg: 'rgba(255,59,92,0.12)',  dot: '#FF3B5C' },
};

export const TASK_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  delivery:  { label: 'Delivery',  color: '#3B9EFF', icon: '📦' },
  pickup:    { label: 'Pick Up',   color: '#FFB800', icon: '🔄' },
  setup:     { label: 'Set Up',    color: '#22D46E', icon: '🔧' },
  teardown:  { label: 'Tear Down', color: '#FF3B5C', icon: '🗑️' },
};

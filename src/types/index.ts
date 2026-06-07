export type Role = 'supervisor' | 'worker';
export type TaskType = 'Delivery' | 'Pick Up' | 'Set Up' | 'Tear Down';
export type TaskStatus = 'Pending' | 'Assigned' | 'Accepted' | 'In Transit' | 'Completed' | 'Cancelled';

export interface Profile {
  id: string;
  name: string;
  role: Role;
  job_title: string | null;
  phone: string | null;
  available: boolean;
  created_at: string;
}

export interface Contractor {
  id: string;
  name: string;
  address: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  total_stock: number;
  available_stock: number;
  unit: string;
  barcode: string | null;
  image_url?: string | null;
}

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  contractor_id: string | null;
  rental_start: string | null;
  rental_end: string | null;
  supervisor_notes: string | null;
  created_at: string;
  completed_at: string | null;
  contractor?: Contractor | null;
  workers?: Profile[];
  items?: { item: InventoryItem; quantity: number }[];
}

export interface TimesheetEntry {
  id: string;
  worker_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
}

export const STATUS_META: Record<string, { bg: string; text: string; dot: string }> = {
  'Pending':    { bg: '#F1F5F9', text: '#64748B', dot: '#94A3B8' },
  'Assigned':   { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  'Accepted':   { bg: '#EFF6FF', text: '#1D4ED8', dot: '#1D4ED8' },
  'In Transit': { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' },
  'Completed':  { bg: '#F0FDF4', text: '#16A34A', dot: '#22C55E' },
  'Cancelled':  { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' },
};

export const TYPE_META: Record<string, { color: string; bg: string }> = {
  'Delivery': { color: '#1D4ED8', bg: '#EFF6FF' },
  'Pick Up':  { color: '#D97706', bg: '#FFFBEB' },
  'Set Up':   { color: '#16A34A', bg: '#F0FDF4' },
  'Tear Down':{ color: '#DC2626', bg: '#FEF2F2' },
};

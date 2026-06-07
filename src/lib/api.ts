import { supabase } from './supabase';
import type { Task, InventoryItem, Profile, Contractor, TimesheetEntry } from '@/types';

// ─── Tasks ───────────────────────────────────────────────────
export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      contractor:contractors(*),
      task_assignments(worker_id, worker:profiles(*)),
      task_items(quantity, item:inventory_items(*))
    `)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return []; }

  return (data || []).map((t: any) => ({
    ...t,
    workers: t.task_assignments?.map((a: any) => a.worker) || [],
    items: t.task_items?.map((ti: any) => ({ item: ti.item, quantity: ti.quantity })) || [],
  }));
}

export async function fetchTask(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      contractor:contractors(*),
      task_assignments(worker_id, worker:profiles(*)),
      task_items(quantity, item:inventory_items(*))
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return {
    ...data,
    workers: data.task_assignments?.map((a: any) => a.worker) || [],
    items: data.task_items?.map((ti: any) => ({ item: ti.item, quantity: ti.quantity })) || [],
  };
}

export async function createTask(payload: {
  type: string;
  contractor_id: string;
  rental_start: string;
  rental_end: string;
  supervisor_notes?: string;
  created_by: string;
  workerIds: string[];
  items: { item_id: string; quantity: number }[];
}) {
  const { workerIds, items, ...taskData } = payload;

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({ ...taskData, status: 'Assigned' })
    .select()
    .single();

  if (error || !task) return { error };

  if (workerIds.length) {
    await supabase.from('task_assignments').insert(
      workerIds.map(id => ({ task_id: task.id, worker_id: id }))
    );
  }

  if (items.length) {
    await supabase.from('task_items').insert(
      items.map(i => ({ task_id: task.id, item_id: i.item_id, quantity: i.quantity }))
    );
    // Decrement available stock
    for (const i of items) {
      await supabase.rpc('decrement_stock', { item_id: i.item_id, qty: i.quantity });
    }
  }

  return { task };
}

export async function updateTaskStatus(id: string, status: string) {
  const updates: any = { status };
  if (status === 'Completed') updates.completed_at = new Date().toISOString();
  const { error } = await supabase.from('tasks').update(updates).eq('id', id);
  return { error };
}

// ─── Inventory ───────────────────────────────────────────────
export async function fetchInventory(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name');
  if (error) return [];
  return data || [];
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id'>) {
  return supabase.from('inventory_items').insert(item).select().single();
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
  return supabase.from('inventory_items').update(updates).eq('id', id);
}

// ─── Workers / Profiles ──────────────────────────────────────
export async function fetchWorkers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'worker')
    .order('name');
  if (error) return [];
  return data || [];
}

export async function updateWorkerAvailability(id: string, available: boolean) {
  return supabase.from('profiles').update({ available }).eq('id', id);
}

// ─── Contractors ─────────────────────────────────────────────
export async function fetchContractors(): Promise<Contractor[]> {
  const { data, error } = await supabase
    .from('contractors')
    .select('*')
    .order('name');
  if (error) return [];
  return data || [];
}

export async function addContractor(c: Omit<Contractor, 'id'>) {
  return supabase.from('contractors').insert(c).select().single();
}

// ─── Timesheet ───────────────────────────────────────────────
export async function fetchTimesheetWeek(workerId: string, weekStart: string): Promise<TimesheetEntry[]> {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const { data, error } = await supabase
    .from('timesheet_entries')
    .select('*')
    .eq('worker_id', workerId)
    .gte('date', weekStart)
    .lte('date', weekEnd.toISOString().split('T')[0])
    .order('date');
  if (error) return [];
  return data || [];
}

export async function clockIn(workerId: string) {
  const today = new Date().toISOString().split('T')[0];
  const now   = new Date().toTimeString().slice(0, 5);
  return supabase.from('timesheet_entries').upsert({
    worker_id: workerId, date: today, clock_in: now
  }, { onConflict: 'worker_id,date' }).select().single();
}

export async function clockOut(workerId: string) {
  const today = new Date().toISOString().split('T')[0];
  const now   = new Date().toTimeString().slice(0, 5);
  return supabase.from('timesheet_entries')
    .update({ clock_out: now })
    .eq('worker_id', workerId).eq('date', today);
}

export async function fetchCurrentUser(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}

'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Package, RefreshCw, Loader2, X } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchInventory, addInventoryItem, fetchCurrentUser } from '@/lib/api';
import type { InventoryItem, Profile } from '@/types';

const CATS = ['All','Signage','Traffic Control','Barricades','Lighting','PPE'];

const list = { hidden:{}, visible:{ transition:{ staggerChildren:0.04 }}};
const item = { hidden:{ opacity:0, y:5 }, visible:{ opacity:1, y:0, transition:{ duration:0.16 }}};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [user,      setUser]      = useState<Profile | null>(null);
  const [search,    setSearch]    = useState('');
  const [cat,       setCat]       = useState('All');
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [newItem,   setNewItem]   = useState({ name:'', category:'Signage', total_stock:0, available_stock:0, unit:'unit', barcode:'' });

  const load = async () => {
    setLoading(true);
    const [inv, u] = await Promise.all([fetchInventory(), fetchCurrentUser()]);
    setInventory(inv); setUser(u); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = inventory.filter(i =>
    (cat === 'All' || i.category === cat) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const total    = inventory.reduce((s, i) => s + i.total_stock, 0);
  const out      = inventory.reduce((s, i) => s + (i.total_stock - i.available_stock), 0);
  const low      = inventory.filter(i => i.total_stock > 0 && i.available_stock / i.total_stock < 0.3).length;

  const getStatus = (inv: InventoryItem) => {
    if (!inv.total_stock) return { l:'N/A',  c:'#94A3B8', bg:'#F1F5F9' };
    const p = inv.available_stock / inv.total_stock;
    if (p === 0)  return { l:'Out',  c:'#DC2626', bg:'#FEF2F2' };
    if (p < 0.3)  return { l:'Low',  c:'#DC2626', bg:'#FEF2F2' };
    if (p < 0.5)  return { l:'Med',  c:'#D97706', bg:'#FFFBEB' };
    return               { l:'OK',   c:'#16A34A', bg:'#F0FDF4' };
  };

  const handleAdd = async () => {
    setSaving(true);
    await addInventoryItem(newItem);
    setSaving(false);
    setShowAdd(false);
    setNewItem({ name:'', category:'Signage', total_stock:0, available_stock:0, unit:'unit', barcode:'' });
    load();
  };

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Inventory</h1>
            <p className="text-[11px] text-text-muted">Real-time stock management</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-icon" title="Refresh">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky' : 'text-text-muted'}`} />
            </button>
            <button onClick={() => setShowAdd(true)} className="btn-navy">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l:'Total Items', v: total, c:'text-sky'  },
            { l:'Out/Rented',  v: out,   c:'text-warn' },
            { l:'Low Stock',   v: low,   c:'text-fail' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.06 }} className="card text-center py-3">
              {loading ? <div className="skel h-7 w-10 rounded mx-auto mb-1" /> : <p className={`text-2xl font-black ${s.c}`}>{s.v}</p>}
              <p className="text-[11px] text-text-muted font-medium">{s.l}</p>
            </motion.div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input type="text" placeholder="Search inventory…" value={search}
              onChange={e => setSearch(e.target.value)} className="input pl-10" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)} className={cat === c ? 'chip-on' : 'chip-off'}>{c}</button>
            ))}
          </div>
        </div>

        {/* Table — desktop */}
        <div className="card !p-0 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skel h-12 rounded-lg" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><Package className="w-5 h-5 text-text-muted" /></div>
              <p className="text-[13px] font-medium">{search ? 'No results' : 'No inventory items'}</p>
              <p className="text-[11px]">{search ? 'Try a different search' : 'Add your first item to get started'}</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead><tr>
                    {['Item','Category','Available','Total','Status','Stock Level'].map(h => <th key={h} className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-muted bg-slate-50/80 border-b border-line">{h}</th>)}
                  </tr></thead>
                  <motion.tbody variants={list} initial="hidden" animate="visible" className="divide-y divide-line">
                    {filtered.map(inv => {
                      const s = getStatus(inv);
                      const pct = inv.total_stock ? inv.available_stock / inv.total_stock : 0;
                      return (
                        <motion.tr key={inv.id} variants={item} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3"><p className="font-semibold text-[13px] text-text-primary">{inv.name}</p>{inv.barcode && <p className="text-[10px] text-text-muted font-mono mt-0.5">#{inv.barcode}</p>}</td>
                          <td className="px-4 py-3"><span className="badge bg-slate-100 text-text-secondary">{inv.category}</span></td>
                          <td className="px-4 py-3"><span className="font-bold text-[13px]" style={{ color: s.c }}>{inv.available_stock}</span></td>
                          <td className="px-4 py-3 text-[13px] text-text-secondary">{inv.total_stock}</td>
                          <td className="px-4 py-3"><span className="badge" style={{ background: s.bg, color: s.c }}>{s.l}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 prog-track"><div className="prog-fill" style={{ width:`${pct*100}%`, background: s.c }} /></div>
                              <span className="text-[11px] text-text-muted">{Math.round(pct*100)}%</span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              </div>

              {/* Mobile list */}
              <motion.div className="md:hidden" variants={list} initial="hidden" animate="visible">
                {filtered.map(inv => {
                  const s = getStatus(inv);
                  const pct = inv.total_stock ? inv.available_stock / inv.total_stock : 0;
                  return (
                    <motion.div key={inv.id} variants={item} className="row">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[13px] text-text-primary">{inv.name}</p>
                          <span className="badge" style={{ background: s.bg, color: s.c }}>{s.l}</span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">{inv.category}</p>
                        <div className="prog-track mt-1.5 w-32"><div className="prog-fill" style={{ width:`${pct*100}%`, background: s.c }} /></div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[13px]" style={{ color: s.c }}>{inv.available_stock}</p>
                        <p className="text-[11px] text-text-muted">of {inv.total_stock}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Add item modal */}
      {showAdd && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <motion.div initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }}
            className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-primary">Add Inventory Item</h3>
              <button onClick={() => setShowAdd(false)} className="btn-icon"><X className="w-4 h-4 text-text-muted" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label">Name</label><input className="input" placeholder="e.g. Arrow Board" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}>
                    {['Signage','Traffic Control','Barricades','Lighting','PPE'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="label">Unit</label><input className="input" placeholder="unit" value={newItem.unit} onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="label">Total Stock</label><input type="number" min="0" className="input" value={newItem.total_stock} onChange={e => setNewItem(p => ({ ...p, total_stock: +e.target.value, available_stock: +e.target.value }))} /></div>
                <div><label className="label">Barcode</label><input className="input" placeholder="optional" value={newItem.barcode} onChange={e => setNewItem(p => ({ ...p, barcode: e.target.value }))} /></div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost flex-1">Cancel</button>
              <button onClick={handleAdd} disabled={!newItem.name || saving} className="btn btn-navy flex-1 disabled:opacity-40">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Item'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AppShell>
  );
}

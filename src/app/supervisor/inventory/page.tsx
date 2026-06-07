'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Package, RefreshCw, Loader2, X,
  Pencil, Trash2, ImagePlus, CheckCircle, AlertCircle,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import {
  fetchInventory, addInventoryItem, updateInventoryItem,
  deleteInventoryItem, uploadInventoryImage, fetchCurrentUser,
} from '@/lib/api';
import type { InventoryItem, Profile } from '@/types';

const CATS = ['All','Signage','Traffic Control','Barricades','Lighting','PPE'];
const CAT_OPTS = ['Signage','Traffic Control','Barricades','Lighting','PPE'];

const BLANK = { name:'', category:'Signage', total_stock:0, available_stock:0, unit:'unit', barcode:'', image_url:'' };

const list = { hidden:{}, visible:{ transition:{ staggerChildren:0.04 }}};
const row  = { hidden:{ opacity:0, y:5 }, visible:{ opacity:1, y:0, transition:{ duration:0.16 }}};

type FormState = typeof BLANK;

function ItemModal({
  mode, initial, onClose, onSave,
}: {
  mode: 'add' | 'edit';
  initial: FormState & { id?: string };
  onClose: () => void;
  onSave: (form: FormState, imageFile: File | null) => Promise<void>;
}) {
  const [form,     setForm]     = useState<FormState>(initial);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [preview,  setPreview]  = useState<string>(initial.image_url || '');
  const [imgFile,  setImgFile]  = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof FormState, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImgFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!form.name.trim()) { setError('Item name is required.'); return; }
    setError(''); setSaving(true);
    await onSave(form, imgFile);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-end md:items-center justify-center p-4 md:p-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y:32, opacity:0, scale:0.97 }}
        animate={{ y:0,  opacity:1, scale:1   }}
        exit={{   y:20, opacity:0, scale:0.97 }}
        transition={{ type:'spring', damping:28, stiffness:360 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-line overflow-hidden mb-20 md:mb-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <h3 className="font-bold text-text-primary text-[15px]">
              {mode === 'add' ? 'Add Inventory Item' : 'Edit Item'}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              {mode === 'add' ? 'Add a new item to stock' : 'Update item details'}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon"><X className="w-4 h-4 text-text-muted" /></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

          {/* Image upload */}
          <div>
            <label className="label">Item Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-full h-36 rounded-xl border-2 border-dashed border-line hover:border-sky/50 transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-slate-50 hover:bg-sky/5 group"
            >
              {preview ? (
                <>
                  <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-[12px] font-semibold flex items-center gap-1.5">
                      <ImagePlus className="w-4 h-4" /> Change image
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-muted">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <ImagePlus className="w-5 h-5" />
                  </div>
                  <p className="text-[12px] font-medium">Click to upload image</p>
                  <p className="text-[10px]">PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImg} />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="label">Item Name *</label>
            <input className="input" placeholder="e.g. Arrow Board (Trailer-Mounted)"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CAT_OPTS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" placeholder="unit / cone / vest"
                value={form.unit} onChange={e => set('unit', e.target.value)} />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Total Stock</label>
              <input type="number" min="0" className="input"
                value={form.total_stock}
                onChange={e => {
                  const v = +e.target.value;
                  set('total_stock', v);
                  if (mode === 'add') set('available_stock', v);
                }} />
            </div>
            <div>
              <label className="label">Available Stock</label>
              <input type="number" min="0" className="input"
                value={form.available_stock}
                onChange={e => set('available_stock', +e.target.value)} />
            </div>
          </div>

          {/* Barcode */}
          <div>
            <label className="label">Barcode <span className="normal-case font-normal text-text-muted">(optional)</span></label>
            <input className="input" placeholder="789-ASC-0001"
              value={form.barcode} onChange={e => set('barcode', e.target.value)} />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="flex items-center gap-2 text-fail text-[12px] bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-line">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <motion.button whileTap={{ scale:0.97 }} onClick={submit} disabled={saving}
            className="btn-navy flex-1 justify-center disabled:opacity-40">
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : mode === 'add' ? 'Add Item' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DeleteModal({ item, onClose, onConfirm }: { item: InventoryItem; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const go = async () => { setLoading(true); await onConfirm(); setLoading(false); };
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
        transition={{ type:'spring', damping:28, stiffness:380 }}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-line text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-fail" />
        </div>
        <h3 className="font-bold text-text-primary mb-1">Delete Item</h3>
        <p className="text-text-muted text-sm mb-1">
          Are you sure you want to delete <strong>{item.name}</strong>?
        </p>
        <p className="text-text-muted text-[11px] mb-5">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={go} disabled={loading}
            className="btn flex-1 bg-fail text-white hover:opacity-90 disabled:opacity-50 justify-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [user,      setUser]      = useState<Profile | null>(null);
  const [search,    setSearch]    = useState('');
  const [cat,       setCat]       = useState('All');
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState<'add' | 'edit' | null>(null);
  const [editing,   setEditing]   = useState<InventoryItem | null>(null);
  const [deleting,  setDeleting]  = useState<InventoryItem | null>(null);
  const [toast,     setToast]     = useState<{ msg:string; ok:boolean } | null>(null);

  const load = async () => {
    setLoading(true);
    const [inv, u] = await Promise.all([fetchInventory(), fetchCurrentUser()]);
    setInventory(inv); setUser(u); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = inventory.filter(i =>
    (cat === 'All' || i.category === cat) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const total    = inventory.reduce((s,i) => s + i.total_stock, 0);
  const out      = inventory.reduce((s,i) => s + (i.total_stock - i.available_stock), 0);
  const low      = inventory.filter(i => i.total_stock > 0 && i.available_stock / i.total_stock < 0.3).length;

  const getStatus = (inv: InventoryItem) => {
    if (!inv.total_stock) return { l:'N/A',  c:'#94A3B8', bg:'#F1F5F9' };
    const p = inv.available_stock / inv.total_stock;
    if (p === 0)  return { l:'Out', c:'#DC2626', bg:'#FEF2F2' };
    if (p < 0.3)  return { l:'Low', c:'#DC2626', bg:'#FEF2F2' };
    if (p < 0.5)  return { l:'Med', c:'#D97706', bg:'#FFFBEB' };
    return               { l:'OK',  c:'#16A34A', bg:'#F0FDF4' };
  };

  const handleSave = async (form: FormState, imgFile: File | null) => {
    let image_url = form.image_url;

    if (modal === 'add') {
      const { data, error } = await addInventoryItem({
        name: form.name, category: form.category,
        total_stock: form.total_stock, available_stock: form.available_stock,
        unit: form.unit, barcode: form.barcode || null,
      });
      if (error || !data) { showToast('Failed to add item.', false); return; }
      if (imgFile) {
        const url = await uploadInventoryImage(imgFile, data.id);
        if (url) await updateInventoryItem(data.id, { image_url: url } as any);
      }
      setModal(null);
      showToast(`${form.name} added.`);
    } else if (modal === 'edit' && editing) {
      if (imgFile) {
        const url = await uploadInventoryImage(imgFile, editing.id);
        if (url) image_url = url;
      }
      await updateInventoryItem(editing.id, {
        name: form.name, category: form.category,
        total_stock: form.total_stock, available_stock: form.available_stock,
        unit: form.unit, barcode: form.barcode || null,
        ...(image_url ? { image_url } : {}),
      } as any);
      setModal(null); setEditing(null);
      showToast(`${form.name} updated.`);
    }
    load();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteInventoryItem(deleting.id);
    setDeleting(null);
    showToast(`${deleting.name} deleted.`);
    load();
  };

  const openEdit = (inv: InventoryItem) => {
    setEditing(inv);
    setModal('edit');
  };

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Inventory</h1>
            <p className="text-[11px] text-text-muted">Manage equipment stock</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-icon" title="Refresh">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky' : 'text-text-muted'}`} />
            </button>
            <button onClick={() => setModal('add')} className="btn-navy text-[13px]">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l:'Total Items', v:total, c:'text-sky'  },
            { l:'Out/Rented',  v:out,   c:'text-warn' },
            { l:'Low Stock',   v:low,   c:'text-fail' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.06 }} className="card text-center py-3">
              {loading ? <div className="skel h-7 w-8 rounded mx-auto mb-1" />
                : <p className={`text-2xl font-black ${s.c}`}>{s.v}</p>}
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

        {/* List */}
        <div className="card !p-0 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skel h-14 rounded-lg" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><Package className="w-5 h-5 text-text-muted" /></div>
              <p className="text-[13px] font-medium">{search ? 'No results' : 'No inventory items'}</p>
              <p className="text-[11px]">{search ? 'Try a different search' : 'Add your first item to get started'}</p>
            </div>
          ) : (
            <motion.div variants={list} initial="hidden" animate="visible">
              {filtered.map(inv => {
                const s   = getStatus(inv);
                const pct = inv.total_stock ? inv.available_stock / inv.total_stock : 0;
                const img = (inv as any).image_url;
                return (
                  <motion.div key={inv.id} variants={row}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-0 hover:bg-slate-50/60 transition-colors group">
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-line shrink-0 overflow-hidden flex items-center justify-center">
                      {img
                        ? <img src={img} alt={inv.name} className="w-full h-full object-cover" />
                        : <Package className="w-4 h-4 text-slate-400" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13px] text-text-primary truncate">{inv.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-text-muted">{inv.category}</span>
                        {inv.barcode && <span className="text-[10px] text-text-muted font-mono">#{inv.barcode}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="prog-track w-24">
                          <div className="prog-fill" style={{ width:`${pct*100}%`, background:s.c }} />
                        </div>
                        <span className="text-[11px] font-bold" style={{ color:s.c }}>
                          {inv.available_stock}<span className="text-text-muted font-normal">/{inv.total_stock} {inv.unit}</span>
                        </span>
                        <span className="badge text-[10px]" style={{ background:s.bg, color:s.c }}>{s.l}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(inv)}
                        className="w-8 h-8 rounded-lg bg-sky/10 border border-sky/20 flex items-center justify-center hover:bg-sky/20 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5 text-sky" />
                      </button>
                      <button
                        onClick={() => setDeleting(inv)}
                        className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-fail" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(modal === 'add' || modal === 'edit') && (
          <ItemModal
            key={modal}
            mode={modal}
            initial={modal === 'edit' && editing
              ? { name: editing.name, category: editing.category, total_stock: editing.total_stock,
                  available_stock: editing.available_stock, unit: editing.unit,
                  barcode: editing.barcode || '', image_url: (editing as any).image_url || '' }
              : BLANK}
            onClose={() => { setModal(null); setEditing(null); }}
            onSave={handleSave}
          />
        )}
        {deleting && (
          <DeleteModal item={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
            className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-[13px] font-semibold z-[80] whitespace-nowrap ${toast.ok ? 'bg-pass' : 'bg-fail'}`}
          >
            {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

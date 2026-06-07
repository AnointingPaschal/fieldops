'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Loader2, Building2, Phone, MapPin, User,
  Mail, Pencil, Trash2, CheckCircle, AlertCircle, Search,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import {
  fetchContractors, createContractor, updateContractor,
  deleteContractor, fetchCurrentUser,
} from '@/lib/api';
import type { Contractor, Profile } from '@/types';

const BLANK = { name:'', address:'', contact_name:'', phone:'' };
type FormState = typeof BLANK;

const list = { hidden:{}, visible:{ transition:{ staggerChildren:0.05 }}};
const row  = { hidden:{ opacity:0, y:6 }, visible:{ opacity:1, y:0, transition:{ duration:0.18 }}};

/* ── Contractor form modal ── */
function ContractorModal({
  mode, initial, onClose, onSave,
}: {
  mode: 'add' | 'edit';
  initial: FormState;
  onClose: () => void;
  onSave: (form: FormState) => Promise<void>;
}) {
  const [form,   setForm]   = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const set = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name.trim())         { setError('Contractor name is required.'); return; }
    if (!form.contact_name.trim()) { setError('Contact person name is required.'); return; }
    setError(''); setSaving(true);
    await onSave(form);
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
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-line overflow-hidden mb-20 md:mb-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <h3 className="font-bold text-text-primary text-[15px]">
              {mode === 'add' ? 'Add Contractor' : 'Edit Contractor'}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              {mode === 'add' ? 'Add a new contractor to the system' : 'Update contractor details'}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="label">Company Name *</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input className="input pl-10" placeholder="e.g. ATCO Electric Ltd."
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Site Address</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
              <textarea className="textarea pl-10" rows={2}
                placeholder="5302 Forand St SW, Calgary, AB T3E 8B4"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Contact Person *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input className="input pl-10" placeholder="Greg Linden"
                  value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input className="input pl-10" placeholder="+1 (403) 000-0000"
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>
          </div>

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
              : mode === 'add' ? 'Add Contractor' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Delete confirm modal ── */
function DeleteModal({ name, onClose, onConfirm }: { name:string; onClose:()=>void; onConfirm:()=>Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const go = async () => { setLoading(true); await onConfirm(); setLoading(false); };
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}
        exit={{ scale:0.95, opacity:0 }} transition={{ type:'spring', damping:28, stiffness:380 }}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-line text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-fail" />
        </div>
        <h3 className="font-bold text-text-primary mb-1">Delete Contractor</h3>
        <p className="text-text-muted text-sm mb-1">
          Are you sure you want to delete <strong>{name}</strong>?
        </p>
        <p className="text-[11px] text-text-muted mb-5">
          This will also remove them from any unassigned tasks.
        </p>
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

/* ── Main page ── */
export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [user,        setUser]        = useState<Profile | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState<'add' | 'edit' | null>(null);
  const [editing,     setEditing]     = useState<Contractor | null>(null);
  const [deleting,    setDeleting]    = useState<Contractor | null>(null);
  const [toast,       setToast]       = useState<{ msg:string; ok:boolean } | null>(null);

  const load = async () => {
    setLoading(true);
    const [c, u] = await Promise.all([fetchContractors(), fetchCurrentUser()]);
    setContractors(c); setUser(u); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = contractors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (form: FormState) => {
    if (modal === 'add') {
      const { error } = await createContractor(form);
      if (error) { showToast('Failed to add contractor.', false); return; }
      showToast(`${form.name} added.`);
    } else if (modal === 'edit' && editing) {
      const { error } = await updateContractor(editing.id, form);
      if (error) { showToast('Failed to update contractor.', false); return; }
      showToast(`${form.name} updated.`);
    }
    setModal(null); setEditing(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await deleteContractor(deleting.id);
    if (error) { showToast('Cannot delete — contractor may be linked to tasks.', false); }
    else showToast(`${deleting.name} deleted.`);
    setDeleting(null);
    load();
  };

  const openEdit = (c: Contractor) => {
    setEditing(c);
    setModal('edit');
  };

  const COLORS = ['#1D4ED8','#16A34A','#7C3AED','#D97706','#DC2626','#0891B2'];

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Contractors</h1>
            <p className="text-[11px] text-text-muted">Manage contractor accounts used in task creation</p>
          </div>
          <button onClick={() => setModal('add')} className="btn-navy text-[13px]">
            <Plus className="w-3.5 h-3.5" /> Add Contractor
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input type="text" placeholder="Search by name or contact…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10" />
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-[11px] text-text-muted">
            {filtered.length} contractor{filtered.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </p>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="skel h-24 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty py-8">
              <div className="empty-icon"><Building2 className="w-5 h-5 text-text-muted" /></div>
              <p className="text-[13px] font-medium">{search ? 'No results' : 'No contractors yet'}</p>
              <p className="text-[11px]">{search ? 'Try a different search' : 'Add your first contractor to get started'}</p>
            </div>
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-3"
            variants={list} initial="hidden" animate="visible">
            {filtered.map((c, i) => {
              const color = COLORS[i % COLORS.length];
              return (
                <motion.div key={c.id} variants={row}
                  className="card hover:shadow-card-md transition-all group relative overflow-hidden">
                  {/* Color accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: color }} />

                  <div className="pl-3">
                    {/* Name + actions */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 text-white"
                          style={{ background: color }}>
                          {c.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[14px] text-text-primary truncate">{c.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)}
                          className="w-8 h-8 rounded-lg bg-sky/10 border border-sky/20 flex items-center justify-center hover:bg-sky/20 transition-colors"
                          title="Edit">
                          <Pencil className="w-3.5 h-3.5 text-sky" />
                        </button>
                        <button onClick={() => setDeleting(c)}
                          className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-fail" />
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5">
                      {c.address && (
                        <div className="flex items-start gap-2 text-[12px] text-text-secondary">
                          <MapPin className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" />
                          <span className="leading-snug">{c.address}</span>
                        </div>
                      )}
                      {c.contact_name && (
                        <div className="flex items-center gap-2 text-[12px] text-text-secondary">
                          <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          <span>{c.contact_name}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-2 text-[12px] text-text-secondary">
                          <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          <a href={`tel:${c.phone}`} className="hover:text-sky transition-colors">{c.phone}</a>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(modal === 'add' || modal === 'edit') && (
          <ContractorModal
            key={modal}
            mode={modal}
            initial={modal === 'edit' && editing
              ? { name: editing.name, address: editing.address || '',
                  contact_name: editing.contact_name || '', phone: editing.phone || '' }
              : BLANK}
            onClose={() => { setModal(null); setEditing(null); }}
            onSave={handleSave}
          />
        )}
        {deleting && (
          <DeleteModal name={deleting.name} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
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

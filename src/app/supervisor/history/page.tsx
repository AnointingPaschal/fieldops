'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, FileText, History, Package, RefreshCw,
  Truck, Wrench, Trash2, Clock, Mail, Plus, X,
  Save, Loader2, CheckCircle, AlertCircle, Bell,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import {
  fetchTasks, fetchCurrentUser,
  fetchReportSchedule, saveReportSchedule,
} from '@/lib/api';
import type { Task, Profile } from '@/types';
import { STATUS_META, TYPE_META } from '@/types';
import { triggerNav } from '@/lib/navigation';
import { useRouter } from 'next/navigation';

const taskIcon: Record<string, any> = {
  'Delivery': Package, 'Pick Up': RefreshCw, 'Set Up': Wrench, 'Tear Down': Trash2,
};

const UNIT_LABELS: Record<string, string> = {
  hours: 'Hour(s)',
  days:  'Day(s)',
  weeks: 'Week(s)',
};

function formatNextSend(iso: string | null): string {
  if (!iso) return 'Not scheduled';
  const d = new Date(iso);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return 'Overdue';
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `In ${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `In ${days} day${days !== 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  return `In ${weeks} week${weeks !== 1 ? 's' : ''}`;
}

export default function HistoryPage() {
  const router = useRouter();
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [user,     setUser]     = useState<Profile | null>(null);
  const [tab,      setTab]      = useState<'tasks' | 'reports'>('tasks');
  const [loading,  setLoading]  = useState(true);

  // Schedule state
  const [schedule,  setSchedule]  = useState<any>(null);
  const [freqVal,   setFreqVal]   = useState(1);
  const [freqUnit,  setFreqUnit]  = useState<'hours'|'days'|'weeks'>('weeks');
  const [enabled,   setEnabled]   = useState(true);
  const [emails,    setEmails]    = useState<string[]>([]);
  const [newEmail,  setNewEmail]  = useState('');
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [emailErr,  setEmailErr]  = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [t, u, sched] = await Promise.all([
        fetchTasks(), fetchCurrentUser(), fetchReportSchedule(),
      ]);
      setTasks(t); setUser(u);
      if (sched) {
        setSchedule(sched);
        setFreqVal(sched.frequency_value);
        setFreqUnit(sched.frequency_unit);
        setEnabled(sched.enabled);
        setEmails(sched.recipients || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const completed = tasks.filter(t => t.status === 'Completed');

  const addEmail = () => {
    const e = newEmail.trim().toLowerCase();
    if (!e) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setEmailErr('Invalid email address.'); return; }
    if (emails.includes(e)) { setEmailErr('Already added.'); return; }
    setEmails(p => [...p, e]);
    setNewEmail('');
    setEmailErr('');
  };

  const saveSchedule = async () => {
    if (!user) return;
    if (emails.length === 0) { setEmailErr('Add at least one recipient email.'); return; }
    setSaving(true);
    const { error } = await saveReportSchedule({
      frequency_value: freqVal,
      frequency_unit:  freqUnit,
      recipients:      emails,
      enabled,
      created_by:      user.id,
    });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      const sched = await fetchReportSchedule();
      setSchedule(sched);
    }
  };

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">History &amp; Reports</h1>
            <p className="text-[11px] text-text-muted">Task log and scheduled reports</p>
          </div>
          <button className="btn-ghost text-[12px]">
            <Share2 className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5">
          {(['tasks','reports'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={tab === t ? 'chip-on' : 'chip-off'}>
              {t === 'tasks' ? 'All Tasks' : 'Report Schedule'}
            </button>
          ))}
        </div>

        {/* ── Tasks tab ── */}
        {tab === 'tasks' && (
          <div className="card !p-0 overflow-hidden">
            {loading ? (
              <div className="p-3 space-y-2">{[1,2,3].map(i=><div key={i} className="skel h-14 rounded-lg"/>)}</div>
            ) : tasks.length === 0 ? (
              <div className="empty">
                <div className="empty-icon"><History className="w-5 h-5 text-text-muted"/></div>
                <p className="text-[13px] font-medium">No tasks yet</p>
              </div>
            ) : (
              <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                {tasks.map(task => {
                  const sm   = STATUS_META[task.status]||STATUS_META['Pending'];
                  const tm   = TYPE_META[task.type]||TYPE_META['Delivery'];
                  const Icon = taskIcon[task.type]||Package;
                  return (
                    <motion.div key={task.id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
                      onClick={()=>{triggerNav();router.push(`/supervisor/tasks/${task.id}`);}}
                      className="row cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center" style={{background:tm.color+'18'}}>
                        <Icon className="w-4 h-4" style={{color:tm.color}}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[13px] text-text-primary">{task.contractor?.name||'No contractor'}</p>
                          <span className="badge" style={{background:sm.bg,color:sm.text}}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{background:sm.dot}}/>{task.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {task.type} · {new Date(task.created_at).toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'})}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* ── Report Schedule tab ── */}
        {tab === 'reports' && (
          <div className="space-y-4">

            {/* Current schedule status */}
            {schedule && (
              <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
                className={`rounded-xl border p-4 flex items-center gap-3 ${
                  schedule.enabled
                    ? 'bg-pass/5 border-pass/25'
                    : 'bg-slate-50 border-line'
                }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  schedule.enabled ? 'bg-pass/15' : 'bg-slate-100'
                }`}>
                  <Bell className={`w-4 h-4 ${schedule.enabled ? 'text-pass' : 'text-text-muted'}`}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-text-primary">
                    {schedule.enabled
                      ? `Every ${schedule.frequency_value} ${UNIT_LABELS[schedule.frequency_unit]}`
                      : 'Scheduled reports paused'}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {schedule.enabled
                      ? `Next report: ${formatNextSend(schedule.next_send_at)} · ${schedule.recipients.length} recipient${schedule.recipients.length!==1?'s':''}`
                      : 'Enable to resume automatic reports'}
                  </p>
                </div>
                <span className={`badge text-[10px] shrink-0 ${schedule.enabled?'bg-pass/10 text-pass':'bg-slate-100 text-slate-400'}`}>
                  {schedule.enabled ? 'Active' : 'Paused'}
                </span>
              </motion.div>
            )}

            {/* Configure card */}
            <div className="card space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[14px] text-text-primary">Configure Schedule</h2>
                {/* Enable toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-text-muted font-medium">{enabled ? 'Enabled' : 'Paused'}</span>
                  <button onClick={() => setEnabled(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-all ${enabled ? 'bg-pass' : 'bg-slate-200'}`}>
                    <motion.span layout className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-5' : 'left-0.5'}`}/>
                  </button>
                </div>
              </div>

              {/* Frequency picker */}
              <div>
                <label className="label">Send report every</label>
                <div className="flex gap-2 items-center">
                  {/* Value input */}
                  <div className="flex items-center border border-line rounded-xl overflow-hidden bg-white shrink-0">
                    <button onClick={() => setFreqVal(v => Math.max(1, v-1))}
                      className="w-10 h-11 flex items-center justify-center text-text-muted hover:bg-slate-50 transition-colors text-lg font-bold border-r border-line">
                      −
                    </button>
                    <input
                      type="number" min="1" max="999"
                      value={freqVal}
                      onChange={e => setFreqVal(Math.max(1, parseInt(e.target.value)||1))}
                      className="w-16 h-11 text-center font-black text-[18px] text-text-primary focus:outline-none bg-transparent"
                    />
                    <button onClick={() => setFreqVal(v => v+1)}
                      className="w-10 h-11 flex items-center justify-center text-text-muted hover:bg-slate-50 transition-colors text-lg font-bold border-l border-line">
                      +
                    </button>
                  </div>

                  {/* Unit selector */}
                  <div className="flex gap-1.5 flex-1 flex-wrap">
                    {(['hours','days','weeks'] as const).map(u => (
                      <button key={u} onClick={() => setFreqUnit(u)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all ${
                          freqUnit === u
                            ? 'bg-navy border-navy text-white'
                            : 'bg-white border-line text-text-secondary hover:border-slate-300'
                        }`}>
                        {u.charAt(0).toUpperCase() + u.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <p className="text-[11px] text-text-muted mt-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3"/>
                  Report will be emailed every <strong>{freqVal} {freqUnit}</strong> to {emails.length || 0} recipient{emails.length !== 1 ? 's' : ''}
                  {emails.length > 0 && ` — next in ${formatNextSend(new Date(Date.now() + freqVal * (freqUnit==='hours'?3600000:freqUnit==='days'?86400000:604800000)).toISOString())}`}
                </p>
              </div>

              {/* Recipients */}
              <div>
                <label className="label">Report Recipients</label>

                {/* Existing emails */}
                {emails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {emails.map(email => (
                      <motion.div key={email} initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}}
                        className="flex items-center gap-2 bg-slate-100 border border-line rounded-lg px-3 py-1.5">
                        <Mail className="w-3.5 h-3.5 text-text-muted shrink-0"/>
                        <span className="text-[12px] font-medium text-text-primary">{email}</span>
                        <button onClick={() => setEmails(p => p.filter(e => e !== email))}
                          className="text-text-muted hover:text-fail transition-colors ml-0.5">
                          <X className="w-3.5 h-3.5"/>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Add new email */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"/>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={newEmail}
                      onChange={e => { setNewEmail(e.target.value); setEmailErr(''); }}
                      onKeyDown={e => e.key === 'Enter' && addEmail()}
                      className="input pl-10"
                    />
                  </div>
                  <button onClick={addEmail} className="btn-navy px-4 shrink-0">
                    <Plus className="w-4 h-4"/> Add
                  </button>
                </div>

                <AnimatePresence>
                  {emailErr && (
                    <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                      className="text-fail text-[12px] flex items-center gap-1.5 mt-2">
                      <AlertCircle className="w-3.5 h-3.5"/>{emailErr}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Save */}
              <motion.button whileTap={{scale:0.97}} onClick={saveSchedule}
                disabled={saving || emails.length === 0}
                className="btn-navy w-full justify-center disabled:opacity-40 py-3 text-[14px]">
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin"/>
                  : saved
                    ? <><CheckCircle className="w-4 h-4"/> Schedule Saved</>
                    : <><Save className="w-4 h-4"/> Save Schedule</>}
              </motion.button>
            </div>

            {/* Info box */}
            <div className="bg-sky/5 border border-sky/20 rounded-xl p-4 space-y-2">
              <p className="text-[12px] font-bold text-sky flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5"/> How automated reports work
              </p>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Reports are generated as a PDF containing all completed tasks, worker timesheets,
                inventory usage and any item discrepancies within the selected period.
                They are automatically emailed to every address in your recipient list.
              </p>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                To activate sending, add a <strong>Supabase Edge Function</strong> with a cron trigger
                that reads this schedule and calls your email provider (Resend, SendGrid, etc.).
                The schedule configuration is saved to your database and ready to use.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="card text-center py-3">
                {loading ? <div className="skel h-7 w-8 rounded mx-auto mb-1"/> : <p className="text-2xl font-black text-sky">{tasks.length}</p>}
                <p className="text-[11px] text-text-muted">Total Tasks</p>
              </div>
              <div className="card text-center py-3">
                {loading ? <div className="skel h-7 w-8 rounded mx-auto mb-1"/> : <p className="text-2xl font-black text-pass">{completed.length}</p>}
                <p className="text-[11px] text-text-muted">Completed</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

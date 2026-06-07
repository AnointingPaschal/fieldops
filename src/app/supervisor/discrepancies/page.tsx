'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Package, Building2, ChevronRight,
  RefreshCw, FileText, DollarSign, CheckCircle,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchDiscrepancyTasks, fetchCurrentUser } from '@/lib/api';
import type { Profile } from '@/types';
import { triggerNav } from '@/lib/navigation';

interface ContractorGroup {
  contractor:  { name: string; address?: string | null; contact_name?: string | null; phone?: string | null };
  tasks:       { task_id: string; type: string; completed_at: string | null; items: any[] }[];
  totalDamaged: number;
  totalMissing: number;
}

const list = { hidden:{}, visible:{ transition:{ staggerChildren:0.06 }}};
const item = { hidden:{ opacity:0, y:6 }, visible:{ opacity:1, y:0, transition:{ duration:0.18 }}};

export default function DiscrepanciesPage() {
  const router = useRouter();
  const [data,    setData]    = useState<any[]>([]);
  const [user,    setUser]    = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [rows, u] = await Promise.all([fetchDiscrepancyTasks(), fetchCurrentUser()]);
    setData(rows); setUser(u); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Group by contractor
  const grouped: ContractorGroup[] = [];
  data.forEach(row => {
    const cn = row.task?.contractor?.name || 'Unknown Contractor';
    let g = grouped.find(g => g.contractor.name === cn);
    if (!g) {
      g = {
        contractor:  row.task?.contractor || { name: cn },
        tasks:       [],
        totalDamaged: 0,
        totalMissing: 0,
      };
      grouped.push(g);
    }
    g.totalDamaged += row.quantity_damaged || 0;
    g.totalMissing += row.quantity_missing || 0;

    let t = g.tasks.find(t => t.task_id === row.task_id);
    if (!t) {
      t = { task_id: row.task_id, type: row.task?.type, completed_at: row.task?.completed_at, items: [] };
      g.tasks.push(t);
    }
    t.items.push(row);
  });

  const totalIssues = grouped.reduce((s, g) => s + g.totalDamaged + g.totalMissing, 0);

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="space-y-4">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-text-primary">Item Discrepancies</h1>
            <p className="text-[11px] text-text-muted">Damaged or missing items — claim from contractors</p>
          </div>
          <button onClick={load} className="btn-icon">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky' : 'text-text-muted'}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l:'Contractors',  v: grouped.length,  c:'text-sky',  I: Building2     },
            { l:'Not Found',    v: grouped.reduce((s,g)=>s+g.totalMissing,0),  c:'text-fail', I: AlertTriangle },
            { l:'Damaged',      v: grouped.reduce((s,g)=>s+g.totalDamaged,0), c:'text-warn', I: Package       },
          ].map(({ l, v, c, I }, i) => (
            <motion.div key={i} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i*0.06 }} className="card text-center py-3">
              <I className={`w-4 h-4 ${c} mx-auto mb-1`} />
              <p className={`text-xl font-black ${c}`}>{loading ? '—' : v}</p>
              <p className="text-[10px] text-text-muted font-medium">{l}</p>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="skel h-32 rounded-xl" />)}</div>
        ) : grouped.length === 0 ? (
          <div className="card">
            <div className="empty py-12">
              <div className="empty-icon"><CheckCircle className="w-6 h-6 text-pass" /></div>
              <p className="text-[13px] font-semibold text-text-primary">All clear!</p>
              <p className="text-[11px] text-text-muted">No damaged or missing items to report.</p>
            </div>
          </div>
        ) : (
          <motion.div className="space-y-4" variants={list} initial="hidden" animate="visible">
            {grouped.map((g, gi) => (
              <motion.div key={gi} variants={item} className="card overflow-hidden !p-0">
                {/* Contractor header */}
                <div className="flex items-center gap-3 px-4 py-4 bg-slate-50 border-b border-line">
                  <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white font-black shrink-0">
                    {g.contractor.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-text-primary">{g.contractor.name}</p>
                    {g.contractor.address && <p className="text-[11px] text-text-muted truncate">{g.contractor.address}</p>}
                    {g.contractor.contact_name && <p className="text-[11px] text-text-muted">{g.contractor.contact_name} · {g.contractor.phone}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    {g.totalMissing > 0 && (
                      <div className="badge bg-fail/10 text-fail mb-1">
                        <AlertTriangle className="w-3 h-3" /> {g.totalMissing} missing
                      </div>
                    )}
                    {g.totalDamaged > 0 && (
                      <div className="badge bg-warn/10 text-warn">
                        <Package className="w-3 h-3" /> {g.totalDamaged} damaged
                      </div>
                    )}
                  </div>
                </div>

                {/* Tasks with discrepancies */}
                {g.tasks.map(t => (
                  <div key={t.task_id} className="border-b border-line last:border-0">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white cursor-pointer hover:bg-slate-50"
                      onClick={() => { triggerNav(); router.push(`/supervisor/tasks/${t.task_id}`); }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-text-muted uppercase">{t.type}</span>
                        {t.completed_at && (
                          <span className="text-[10px] text-text-muted">
                            · {new Date(t.completed_at).toLocaleDateString('en-CA',{ month:'short', day:'numeric', year:'numeric' })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); triggerNav(); router.push(`/worker/tasks/${t.task_id}/report`); }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-sky hover:underline">
                          <FileText className="w-3.5 h-3.5" /> Report
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>

                    {/* Item breakdown */}
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead>
                        <tr className="bg-slate-50/80">
                          {['Item','Assigned','Recovered','Damaged','Not Found','Notes'].map(h => (
                            <th key={h} className="text-left px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wide border-b border-line">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.items.map((r: any, ri: number) => (
                          <tr key={ri} className={`border-b border-line last:border-0 ${ri%2===0 ? '' : 'bg-slate-50/40'}`}>
                            <td className="px-4 py-2.5 text-[12px] font-semibold text-text-primary">{r.item?.name}</td>
                            <td className="px-4 py-2.5 text-[12px] text-text-secondary text-center">{r.quantity_assigned}</td>
                            <td className="px-4 py-2.5 text-[12px] font-bold text-pass text-center">{r.quantity_recovered}</td>
                            <td className="px-4 py-2.5 text-[12px] font-bold text-center" style={{ color: r.quantity_damaged>0?'#D97706':'#94A3B8' }}>
                              {r.quantity_damaged}
                            </td>
                            <td className="px-4 py-2.5 text-[12px] font-bold text-center" style={{ color: r.quantity_missing>0?'#DC2626':'#94A3B8' }}>
                              {r.quantity_missing}
                            </td>
                            <td className="px-4 py-2.5 text-[11px] text-text-muted">{r.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                {/* Claim footer */}
                <div className="px-4 py-3 bg-warn/5 border-t border-warn/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12px] text-warn font-semibold">
                    <DollarSign className="w-4 h-4" />
                    {g.totalMissing + g.totalDamaged} item(s) to claim from {g.contractor.name}
                  </div>
                  <button
                    onClick={() => { triggerNav(); router.push(`/supervisor/tasks/${g.tasks[0]?.task_id}`); }}
                    className="text-[11px] font-bold text-sky hover:underline flex items-center gap-1">
                    View Tasks <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}

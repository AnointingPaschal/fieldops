'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchTask, fetchItemRecovery, fetchCurrentUser } from '@/lib/api';
import type { Task, Profile } from '@/types';

export default function TaskReportPage() {
  const params   = useParams();
  const taskId   = params?.id as string;
  const [task,     setTask]     = useState<Task | null>(null);
  const [recovery, setRecovery] = useState<any[]>([]);
  const [user,     setUser]     = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      const [t, rec, u] = await Promise.all([
        fetchTask(taskId), fetchItemRecovery(taskId), fetchCurrentUser()
      ]);
      setTask(t); setRecovery(rec); setUser(u); setLoading(false);
    };
    if (taskId) load();
  }, [taskId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  if (!task) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Report not found</p>
    </div>
  );

  const completedDate = task.completed_at
    ? new Date(task.completed_at).toLocaleDateString('en-CA',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })
    : '';
  const completedTime = task.completed_at
    ? new Date(task.completed_at).toLocaleTimeString('en-CA',{ hour:'2-digit', minute:'2-digit', hour12:true })
    : '';

  const totalAssigned  = recovery.reduce((s, r) => s + r.quantity_assigned, 0);
  const totalRecovered = recovery.reduce((s, r) => s + r.quantity_recovered, 0);
  const totalDamaged   = recovery.reduce((s, r) => s + r.quantity_damaged, 0);
  const totalMissing   = recovery.reduce((s, r) => s + r.quantity_missing, 0);
  const hasDiscrepancy = totalDamaged > 0 || totalMissing > 0;

  // If no recovery records, use task items
  const items = recovery.length > 0 ? recovery : (task.items || []).map(({ item, quantity }) => ({
    item: { name: item.name, unit: item.unit },
    quantity_assigned: quantity,
    quantity_recovered: quantity,
    quantity_damaged: 0,
    quantity_missing: 0,
    notes: '',
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Inter',sans-serif; background:#f5f5f5; }
        @media print {
          body { background:white; }
          .no-print { display:none!important; }
          .page { box-shadow:none!important; margin:0!important; max-width:100%!important; }
        }
      `}</style>

      {/* Print button — hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => window.print()}
          style={{ background:'#6B21A8', color:'white', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          Download PDF / Print
        </button>
        <button onClick={() => window.history.back()}
          style={{ background:'white', color:'#475569', border:'1px solid #E2E8F0', borderRadius:10, padding:'10px 20px', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          ← Back
        </button>
      </div>

      {/* Document */}
      <div className="page" style={{ maxWidth:800, margin:'40px auto 80px', background:'white', boxShadow:'0 4px 32px rgba(0,0,0,0.1)', borderRadius:8, overflow:'hidden' }}>

        {/* Header */}
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <tbody>
            <tr>
              {/* Logo cell */}
              <td style={{ width:200, padding:'20px 24px', verticalAlign:'middle', borderBottom:'2px solid #E2E8F0' }}>
                <div style={{ background:'black', borderRadius:6, padding:'10px 14px', display:'inline-block' }}>
                  <p style={{ color:'#FF8C00', fontWeight:900, fontSize:16, lineHeight:1.1 }}>Alberta</p>
                  <p style={{ color:'white',   fontWeight:800, fontSize:14, lineHeight:1.1 }}>Safety</p>
                  <p style={{ color:'white',   fontWeight:800, fontSize:14, lineHeight:1.1 }}>Control</p>
                </div>
              </td>
              {/* Company info */}
              <td style={{ padding:'20px 24px', verticalAlign:'middle', textAlign:'center', borderBottom:'2px solid #E2E8F0' }}>
                <p style={{ fontWeight:900, fontSize:20, color:'#0F172A' }}>Alberta Safety Control</p>
                <p style={{ fontSize:12, color:'#64748B', marginTop:4 }}>admin@albertasafetycontrol.com</p>
                <p style={{ fontSize:12, color:'#64748B' }}>www.albertasafetycontrol.com</p>
              </td>
              {/* Type badge */}
              <td style={{ width:160, background:'#6B21A8', padding:'20px 24px', verticalAlign:'middle', textAlign:'center', borderBottom:'2px solid #E2E8F0' }}>
                <p style={{ color:'white', fontWeight:900, fontSize:17, lineHeight:1.2, textTransform:'uppercase' }}>
                  {task.type.replace(' ', ' /\n')}
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Job details */}
        <div style={{ margin:'24px 24px 0' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', border:'1px solid #E2E8F0', borderRadius:6, overflow:'hidden' }}>
            <thead>
              <tr>
                <td colSpan={2} style={{ background:'#F8FAFC', padding:'10px 16px', fontWeight:800, fontSize:13, borderBottom:'1px solid #E2E8F0' }}>
                  JOB DETAILS
                </td>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom:'1px solid #E2E8F0' }}>
                <td style={{ padding:'10px 16px', fontWeight:700, fontSize:13, width:140, color:'#475569' }}>Contractor:</td>
                <td style={{ padding:'10px 16px', fontWeight:800, fontSize:13, color:'#6B21A8' }}>{task.contractor?.name || '—'}</td>
              </tr>
              <tr style={{ borderBottom:'1px solid #E2E8F0' }}>
                <td style={{ padding:'10px 16px', fontWeight:700, fontSize:13, color:'#475569' }}>Location:</td>
                <td style={{ padding:'10px 16px', fontSize:13 }}>{task.contractor?.address || '—'} — {task.type}</td>
              </tr>
              <tr>
                <td style={{ padding:'10px 16px', fontWeight:700, fontSize:13, color:'#475569' }}>Date &amp; Time:</td>
                <td style={{ padding:'10px 16px', fontWeight:700, fontSize:13, color:'#6B21A8' }}>
                  {completedDate} — {completedTime}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Items table */}
        <div style={{ margin:'20px 24px 0' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', border:'1px solid #E2E8F0', borderRadius:6, overflow:'hidden' }}>
            <thead>
              <tr style={{ background:'#6B21A8' }}>
                <td colSpan={4} style={{ padding:'10px 16px', fontWeight:800, fontSize:13, color:'white', textAlign:'center', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  ITEMS — {task.type.toUpperCase()}
                </td>
              </tr>
              <tr style={{ background:'#6B21A8' }}>
                {['#','Item Description','Qty','Notes / Condition'].map((h,i) => (
                  <td key={i} style={{
                    padding:'8px 14px', color:'white', fontWeight:700, fontSize:12,
                    textAlign: i===0||i===2 ? 'center' : 'left',
                    width: i===0 ? 40 : i===2 ? 60 : undefined,
                  }}>{h}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((r: any, i: number) => {
                const name      = r.item?.name || r.name || '—';
                const assigned  = r.quantity_assigned  ?? r.assigned  ?? 0;
                const damaged   = r.quantity_damaged   ?? r.damaged   ?? 0;
                const missing   = r.quantity_missing   ?? r.missing   ?? 0;
                const recovered = r.quantity_recovered ?? r.recovered ?? 0;
                const notes     = r.notes || '';

                const condParts: string[] = [];
                if (missing  > 0) condParts.push(`${missing} Not Found`);
                if (damaged  > 0) condParts.push(`${damaged} Damaged`);
                if (condParts.length === 0 && recovered === assigned) condParts.push('All Recovered');

                const rowBg = (i%2===0) ? '#FFFFFF' : '#F8FAFC';
                const condColor = missing > 0 || damaged > 0 ? '#DC2626' : '#16A34A';

                return (
                  <tr key={i} style={{ borderBottom:'1px solid #E2E8F0', background: rowBg }}>
                    <td style={{ padding:'10px 14px', textAlign:'center', fontWeight:600, fontSize:13, color:'#64748B' }}>{i+1}</td>
                    <td style={{ padding:'10px 14px', fontSize:13 }}>{name}</td>
                    <td style={{ padding:'10px 14px', textAlign:'center', fontWeight:800, fontSize:14, color:'#6B21A8' }}>{assigned}</td>
                    <td style={{ padding:'10px 14px', fontSize:12 }}>
                      <span style={{ color: condColor, fontWeight:600 }}>
                        {condParts.join(' · ')}
                      </span>
                      {notes && <p style={{ color:'#64748B', marginTop:2, fontSize:11 }}>{notes}</p>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals */}
            <tfoot>
              <tr style={{ background:'#F1F5F9', borderTop:'2px solid #E2E8F0' }}>
                <td colSpan={2} style={{ padding:'10px 14px', fontWeight:800, fontSize:13, textAlign:'right' }}>Total:</td>
                <td style={{ padding:'10px 14px', textAlign:'center', fontWeight:900, fontSize:14, color:'#6B21A8' }}>{totalAssigned}</td>
                <td style={{ padding:'10px 14px', fontSize:12, color:'#475569', fontWeight:600 }}>
                  {totalRecovered} Recovered · {totalDamaged} Damaged · {totalMissing} Not Found
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Discrepancy note */}
        {hasDiscrepancy && (
          <div style={{ margin:'16px 24px 0', background:'#FEF3C7', border:'2px solid #F59E0B', borderRadius:6, padding:'12px 16px', display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ fontSize:16 }}>⚠</span>
            <p style={{ fontSize:12, color:'#92400E', fontWeight:600 }}>
              NOTE: {totalMissing > 0 ? `${totalMissing} item(s) could not be located. ` : ''}
              {totalDamaged > 0 ? `${totalDamaged} item(s) returned with damage. ` : ''}
              See individual item notes above for details.
            </p>
          </div>
        )}

        {/* Collection confirmation */}
        <div style={{ margin:'20px 24px 24px' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', border:'1px solid #E2E8F0', borderRadius:6, overflow:'hidden' }}>
            <thead>
              <tr>
                <td colSpan={4} style={{ background:'#F8FAFC', padding:'10px 16px', fontWeight:800, fontSize:13, borderBottom:'1px solid #E2E8F0' }}>
                  COLLECTION CONFIRMATION
                </td>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom:'1px solid #E2E8F0' }}>
                <td style={{ padding:'12px 16px', fontWeight:700, fontSize:12, color:'#475569', width:'25%' }}>Date &amp; Time:</td>
                <td style={{ padding:'12px 16px', fontWeight:700, fontSize:12, color:'#6B21A8' }}>{completedDate} — {completedTime}</td>
                <td style={{ padding:'12px 16px', fontWeight:700, fontSize:12, color:'#475569', width:'25%' }}>Supervisor Signature:</td>
                <td style={{ padding:'12px 16px', borderBottom:'1px solid #0F172A', minWidth:160 }}>&nbsp;</td>
              </tr>
              <tr>
                <td style={{ padding:'12px 16px', fontWeight:700, fontSize:12, color:'#475569' }}>{task.type} done by:</td>
                <td style={{ padding:'12px 16px', fontWeight:900, fontSize:18, color:'#0F172A', textTransform:'uppercase' }}>
                  {user?.name?.split(' ')[0] || 'WORKER'}
                </td>
                <td style={{ padding:'12px 16px', fontWeight:700, fontSize:12, color:'#475569' }}>Client Signature:</td>
                <td style={{ padding:'12px 16px', borderBottom:'1px solid #0F172A' }}>&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ background:'#F8FAFC', borderTop:'1px solid #E2E8F0', padding:'14px 24px', textAlign:'center' }}>
          <p style={{ fontSize:11, color:'#64748B', fontStyle:'italic' }}>
            "ALL Hours MUST be signed and authorized by supervisor before being sent in"
          </p>
          <p style={{ fontSize:11, color:'#64748B', fontStyle:'italic', marginTop:4 }}>
            *time cards must be scanned and sent to admin@albertasafetycontrol.com every second Friday
          </p>
        </div>
      </div>
    </>
  );
}

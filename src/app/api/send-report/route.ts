import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Generate PDF buffer ────────────────────────────────────────
async function generatePDF(data: {
  period: string; tasks: any[]; workers: any[];
  discrepancies: any[]; company: Record<string,string>;
}): Promise<Buffer> {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const { period, tasks, discrepancies, company } = data;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const active    = tasks.filter(t => !['Completed','Cancelled'].includes(t.status)).length;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W   = doc.internal.pageSize.getWidth();
  let y     = 0;

  // ── Header bar ──
  doc.setFillColor(11, 29, 53); // navy
  doc.rect(0, 0, W, 36, 'F');

  // Logo (if available)
  if (company.company_logo_url) {
    try {
      const res = await fetch(company.company_logo_url);
      const buf = await res.arrayBuffer();
      const b64 = Buffer.from(buf).toString('base64');
      const ext = company.company_logo_url.includes('.png') ? 'PNG' : 'JPEG';
      doc.addImage(`data:image/${ext.toLowerCase()};base64,${b64}`, ext, 8, 6, 24, 24);
    } catch { /* skip logo on error */ }
  }

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14); doc.setFont('helvetica','bold');
  doc.text(company.company_name || 'Alberta Safety Control', 36, 16);
  doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.setTextColor(148, 163, 184);
  doc.text(company.company_email || 'admin@albertasafetycontrol.com', 36, 22);
  doc.text(company.company_website || 'www.albertasafetycontrol.com', 36, 27);

  // Report type badge
  doc.setFillColor(29, 78, 216); // sky
  doc.roundedRect(W-52, 8, 44, 18, 3, 3, 'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text('OPERATIONS', W-30, 16, { align:'center' });
  doc.text('REPORT', W-30, 22, { align:'center' });

  y = 44;

  // Period
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11); doc.setFont('helvetica','bold');
  doc.text(`Operations Report — ${period}`, 14, y);
  doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleString('en-CA')}`, 14, y+5);
  y += 14;

  // ── Stats row ──
  const stats = [
    { l:'Total Tasks', v: tasks.length  },
    { l:'Completed',   v: completed     },
    { l:'Active',      v: active        },
    { l:'Workers',     v: data.workers.length },
  ];
  const boxW = (W - 28) / 4;
  stats.forEach((s, i) => {
    const x = 14 + i * (boxW + 2);
    doc.setFillColor(240, 244, 248);
    doc.roundedRect(x, y, boxW, 16, 2, 2, 'F');
    doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.setTextColor(29, 78, 216);
    doc.text(String(s.v), x + boxW/2, y+8, { align:'center' });
    doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.setTextColor(100, 116, 139);
    doc.text(s.l, x + boxW/2, y+13, { align:'center' });
  });
  y += 22;

  // ── Tasks table ──
  doc.setFontSize(10); doc.setFont('helvetica','bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Task Activity', 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Contractor','Type','Status','Created','Completed']],
    body: tasks.slice(0, 30).map(t => [
      t.contractor?.name || '—',
      t.type,
      t.status,
      new Date(t.created_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'}),
      t.completed_at ? new Date(t.completed_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—',
    ]),
    headStyles: { fillColor:[11,29,53], textColor:255, fontSize:8, fontStyle:'bold' },
    bodyStyles: { fontSize:8, textColor:[15,23,42] },
    alternateRowStyles: { fillColor:[248,250,252] },
    columnStyles: {
      2: { cellWidth: 24,
        didParseCell: (d: any) => {
          if (d.section==='body') {
            const status = d.cell.raw;
            if (status==='Completed') d.cell.styles.textColor=[22,163,74];
            else if (status==='In Transit') d.cell.styles.textColor=[217,119,6];
            else d.cell.styles.textColor=[29,78,216];
          }
        }
      },
    },
    margin: { left: 14, right: 14 },
    styles: { cellPadding: 2.5 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Discrepancies ──
  if (discrepancies.length > 0) {
    // Check page break
    if (y > 220) { doc.addPage(); y = 20; }

    doc.setFillColor(254, 242, 242);
    doc.roundedRect(14, y, W-28, 10, 2, 2, 'F');
    doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`⚠  Item Discrepancies — ${discrepancies.length} item(s) need attention`, 18, y+6.5);
    y += 14;

    autoTable(doc, {
      startY: y,
      head: [['Contractor','Item','Assigned','Recovered','Damaged','Not Found','Notes']],
      body: discrepancies.map((r: any) => [
        r.task?.contractor?.name||'—',
        r.item?.name||'—',
        r.quantity_assigned, r.quantity_recovered,
        r.quantity_damaged, r.quantity_missing, r.notes||'—',
      ]),
      headStyles: { fillColor:[220,38,38], textColor:255, fontSize:8, fontStyle:'bold' },
      bodyStyles: { fontSize:8, textColor:[15,23,42] },
      alternateRowStyles: { fillColor:[255,245,245] },
      columnStyles: {
        4: { textColor:[217,119,6], fontStyle:'bold' },
        5: { textColor:[220,38,38], fontStyle:'bold' },
      },
      margin: { left: 14, right: 14 },
      styles: { cellPadding: 2.5 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFillColor(240,253,244);
    doc.roundedRect(14, y, W-28, 10, 2, 2, 'F');
    doc.setFontSize(9); doc.setFont('helvetica','normal');
    doc.setTextColor(22,163,74);
    doc.text('✓  No item discrepancies — all equipment accounted for', 18, y+6.5);
    y += 16;
  }

  // ── Footer ──
  const pages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 285, W, 12, 'F');
    doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.setTextColor(148, 163, 184);
    doc.text(company.company_name || 'Alberta Safety Control', 14, 291);
    if (company.company_address) doc.text(company.company_address, 14, 295);
    doc.text(`Page ${i} of ${pages}`, W-14, 291, { align:'right' });
    doc.text('"ALL Hours MUST be signed and authorized by supervisor before being sent in"', W/2, 295, { align:'center' });
  }

  return Buffer.from(doc.output('arraybuffer'));
}

// ── HTML email ─────────────────────────────────────────────────
function buildEmailHtml(data: {
  period: string; tasks: any[]; workers: any[];
  discrepancies: any[]; company: Record<string,string>;
}): string {
  const { period, tasks, workers, discrepancies, company } = data;
  const name    = company.company_name    || 'Alberta Safety Control';
  const email   = company.company_email   || 'admin@albertasafetycontrol.com';
  const website = company.company_website || 'www.albertasafetycontrol.com';
  const phone   = company.company_phone   || '';
  const address = company.company_address || '';
  const logoUrl = company.company_logo_url;

  const completed = tasks.filter(t=>t.status==='Completed').length;
  const active    = tasks.filter(t=>!['Completed','Cancelled'].includes(t.status)).length;
  const hasD      = discrepancies.length > 0;

  const taskRows = tasks.slice(0,10).map(t=>`
    <tr style="border-bottom:1px solid #E2E8F0;">
      <td style="padding:10px 16px;font-size:13px;color:#0F172A;font-weight:600;">${t.contractor?.name||'—'}</td>
      <td style="padding:10px 16px;font-size:12px;color:#64748B;">${t.type}</td>
      <td style="padding:10px 16px;">
        <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
          background:${t.status==='Completed'?'#F0FDF4':t.status==='In Transit'?'#FFFBEB':'#EFF6FF'};
          color:${t.status==='Completed'?'#16A34A':t.status==='In Transit'?'#D97706':'#1D4ED8'};">${t.status}</span>
      </td>
      <td style="padding:10px 16px;font-size:12px;color:#64748B;">${t.completed_at?new Date(t.completed_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'}):'—'}</td>
    </tr>`).join('');

  const discrepRows = discrepancies.slice(0,8).map((r:any)=>`
    <tr style="border-bottom:1px solid #FEE2E2;background:#FFF5F5;">
      <td style="padding:9px 14px;font-size:12px;color:#0F172A;font-weight:600;">${r.task?.contractor?.name||'—'}</td>
      <td style="padding:9px 14px;font-size:12px;color:#475569;">${r.item?.name||'—'}</td>
      <td style="padding:9px 14px;font-size:12px;font-weight:700;color:#D97706;text-align:center;">${r.quantity_damaged||0}</td>
      <td style="padding:9px 14px;font-size:12px;font-weight:700;color:#DC2626;text-align:center;">${r.quantity_missing||0}</td>
    </tr>`).join('');

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${name}" style="height:40px;max-width:140px;object-fit:contain;"/>`
    : `<div style="background:black;border-radius:8px;display:inline-block;padding:8px 12px;"><div style="color:#FF8C00;font-weight:900;font-size:14px;line-height:1.1;">Alberta</div><div style="color:white;font-weight:800;font-size:12px;line-height:1.1;">Safety</div><div style="color:white;font-weight:800;font-size:12px;line-height:1.1;">Control</div></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${name} — Operations Report</title></head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:640px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">
  <div style="background:#0B1D35;padding:32px 40px;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;border:1px solid rgba(255,255,255,0.06);"></div>
    <table style="width:100%;border-collapse:collapse;"><tr>
      <td style="vertical-align:middle;">${logoHtml}</td>
      <td style="text-align:right;vertical-align:middle;">
        <div style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Operations Report</div>
        <div style="color:white;font-size:15px;font-weight:800;">${period}</div>
      </td>
    </tr></table>
    <div style="margin-top:24px;">
      <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:5px;">Your field operations summary is ready</div>
      <div style="color:white;font-size:22px;font-weight:900;line-height:1.2;">Field Operations<br/>Summary Report</div>
    </div>
  </div>
  <div style="background:#1D4ED8;">
    <table style="width:100%;border-collapse:collapse;"><tr>
      ${[{l:'Total Tasks',v:tasks.length,i:'📋'},{l:'Completed',v:completed,i:'✅'},{l:'Active',v:active,i:'⚡'},{l:'Workers',v:workers.length,i:'👷'}]
        .map(s=>`<td style="padding:16px 10px;text-align:center;border-right:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:18px;margin-bottom:3px;">${s.i}</div>
          <div style="color:white;font-size:22px;font-weight:900;line-height:1;">${s.v}</div>
          <div style="color:rgba(255,255,255,0.55);font-size:10px;margin-top:3px;text-transform:uppercase;letter-spacing:0.05em;">${s.l}</div>
        </td>`).join('')}
    </tr></table>
  </div>
  <div style="padding:32px 40px;">
    <div style="margin-bottom:28px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <h2 style="margin:0;font-size:14px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:0.05em;">Task Activity</h2>
        <span style="font-size:11px;color:#94A3B8;font-weight:600;">${tasks.length} total · PDF attached</span>
      </div>
      <div style="border-radius:12px;overflow:hidden;border:1px solid #E2E8F0;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#F8FAFC;">
            ${['Contractor','Type','Status','Completed'].map(h=>`<th style="padding:9px 16px;text-align:left;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #E2E8F0;">${h}</th>`).join('')}
          </tr></thead>
          <tbody>${taskRows||'<tr><td colspan="4" style="padding:20px;text-align:center;color:#94A3B8;font-size:13px;">No tasks in this period</td></tr>'}</tbody>
        </table>
        ${tasks.length>10?`<div style="padding:10px 16px;background:#F8FAFC;text-align:center;font-size:12px;color:#64748B;border-top:1px solid #E2E8F0;">+${tasks.length-10} more tasks — see attached PDF</div>`:''}
      </div>
    </div>
    ${hasD?`
    <div style="margin-bottom:28px;">
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:14px 18px;margin-bottom:14px;display:flex;align-items:center;gap:10px;">
        <div style="font-size:22px;">⚠️</div>
        <div><div style="font-size:13px;font-weight:800;color:#DC2626;margin-bottom:2px;">Item Discrepancies Detected</div>
        <div style="font-size:12px;color:#B91C1C;">${discrepancies.length} item(s) — see full breakdown in the attached PDF</div></div>
      </div>
      <div style="border-radius:12px;overflow:hidden;border:1px solid #FECACA;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#FEF2F2;">
            ${['Contractor','Item','Damaged','Not Found'].map(h=>`<th style="padding:8px 14px;text-align:left;font-size:11px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #FECACA;">${h}</th>`).join('')}
          </tr></thead>
          <tbody>${discrepRows}</tbody>
        </table>
      </div>
    </div>`:`
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:14px 18px;margin-bottom:28px;display:flex;align-items:center;gap:10px;">
      <div style="font-size:22px;">✅</div>
      <div style="font-size:13px;font-weight:700;color:#16A34A;">No discrepancies — all equipment accounted for</div>
    </div>`}
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px 20px;margin-bottom:28px;display:flex;align-items:center;gap:12px;">
      <div style="font-size:22px;">📎</div>
      <div><div style="font-size:13px;font-weight:700;color:#0F172A;margin-bottom:2px;">Full PDF Report Attached</div>
      <div style="font-size:12px;color:#64748B;">A complete PDF with all tasks, workers and discrepancy breakdowns is attached to this email.</div></div>
    </div>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL||'https://fieldops.vercel.app'}/supervisor/dashboard"
        style="display:inline-block;background:#0B1D35;color:white;font-size:14px;font-weight:800;padding:14px 36px;border-radius:12px;text-decoration:none;">
        View Full Dashboard →
      </a>
    </div>
  </div>
  <div style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:22px 40px;text-align:center;">
    <div style="font-size:13px;font-weight:800;color:#0F172A;margin-bottom:3px;">${name}</div>
    <div style="font-size:11px;color:#94A3B8;margin-bottom:2px;">${email}${phone?` · ${phone}`:''}${address?` · ${address}`:''}</div>
    ${website?`<div style="font-size:11px;color:#94A3B8;margin-bottom:10px;">${website}</div>`:''}
    <div style="font-size:10px;color:#CBD5E1;line-height:1.6;">
      This report was automatically generated by FieldOps.<br/>
      <em>"ALL Hours MUST be signed and authorized by supervisor before being sent in"</em>
    </div>
  </div>
</div></body></html>`;
}

// ── Send via provider ──────────────────────────────────────────
async function sendEmail(opts: {
  provider: string; settings: Record<string,string>;
  to: string[]; subject: string; html: string; pdfBuffer: Buffer;
  period: string;
}) {
  const { provider, settings, to, subject, html, pdfBuffer, period } = opts;
  const filename = `FieldOps_Report_${period.replace(/\s/g,'_')}.pdf`;

  if (provider === 'mailjet') {
    const res = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${settings.mailjet_api_key}:${settings.mailjet_secret_key}`).toString('base64'),
      },
      body: JSON.stringify({
        Messages: to.map(email => ({
          From: { Email: settings.mailjet_from_email||'reports@albertasafetycontrol.com', Name: settings.mailjet_from_name||'Alberta Safety Control' },
          To:   [{ Email: email }],
          Subject: subject,
          HTMLPart: html,
          Attachments: [{
            ContentType: 'application/pdf',
            Filename: filename,
            Base64Content: pdfBuffer.toString('base64'),
          }],
        })),
      }),
    });
    if (!res.ok) throw new Error(`Mailjet error: ${await res.text()}`);
    return { sent: to.length };
  }

  if (provider === 'gmail') {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 587, secure: false,
      auth: { user: settings.gmail_email, pass: settings.gmail_app_password },
    });
    for (const email of to) {
      await transporter.sendMail({
        from:    `"${settings.gmail_from_name||'Alberta Safety Control'}" <${settings.gmail_email}>`,
        to:      email, subject, html,
        attachments: [{ filename, content: pdfBuffer, contentType: 'application/pdf' }],
      });
    }
    return { sent: to.length };
  }

  throw new Error(`Unknown provider: ${provider}`);
}

export async function POST(req: NextRequest) {
  try {
    const db   = admin();
    const body = await req.json().catch(() => ({}));
    const isTest = body.test === true;

    const { data: rows } = await db.from('app_settings').select('key,value');
    const s: Record<string,string> = {};
    (rows||[]).forEach((r:any) => { s[r.key] = r.value; });

    const provider = s.active_email_provider || 'mailjet';
    if (provider==='mailjet' && (!s.mailjet_api_key||!s.mailjet_secret_key))
      return NextResponse.json({ error: 'Mailjet API keys not configured. Go to Settings.' }, { status: 400 });
    if (provider==='gmail' && (!s.gmail_email||!s.gmail_app_password))
      return NextResponse.json({ error: 'Gmail credentials not configured. Go to Settings.' }, { status: 400 });

    const { data: schedule } = await db.from('report_schedules').select('*').order('updated_at',{ascending:false}).limit(1).maybeSingle();
    const recipients: string[] = isTest ? [body.testEmail].filter(Boolean) : (schedule?.recipients||[]);
    if (!recipients.length) return NextResponse.json({ error: 'No recipients configured.' }, { status: 400 });

    const [{ data: tasks }, { data: workers }, { data: discrepancies }] = await Promise.all([
      db.from('tasks').select('*,contractor:contractors(name)').order('created_at',{ascending:false}).limit(50),
      db.from('profiles').select('id,name').eq('role','worker'),
      db.from('task_item_recovery').select('*,item:inventory_items(name),task:tasks(contractor:contractors(name))').or('quantity_damaged.gt.0,quantity_missing.gt.0'),
    ]);

    const period  = new Date().toLocaleDateString('en-CA',{month:'long',day:'numeric',year:'numeric'});
    const subject = isTest ? `[TEST] FieldOps Report — ${period}` : `FieldOps Operations Report — ${period}`;
    const company = s;
    const payload = { period, tasks:tasks||[], workers:workers||[], discrepancies:discrepancies||[], company };

    const [html, pdfBuffer] = await Promise.all([
      buildEmailHtml(payload),
      generatePDF(payload),
    ]);

    const result = await sendEmail({ provider, settings:s, to:recipients, subject, html, pdfBuffer, period });

    if (!isTest && schedule) {
      const ms: Record<string,number> = { hours:3600000, days:86400000, weeks:604800000 };
      await db.from('report_schedules').update({
        last_sent_at: new Date().toISOString(),
        next_send_at: new Date(Date.now()+(schedule.frequency_value||1)*ms[schedule.frequency_unit||'weeks']).toISOString(),
      }).eq('id', schedule.id);
    }

    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

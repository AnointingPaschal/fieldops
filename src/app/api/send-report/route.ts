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

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const W   = doc.internal.pageSize.getWidth();
  let y     = 0;

  // ── Header bar ──
  doc.setFillColor(11, 29, 53); // navy
  doc.rect(0, 0, W, 36, 'F');

  // Company name (no logo in PDF to keep file size small)
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
    body: tasks.slice(0, 20).map(t => [
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
      2: { cellWidth: 24 },
    },
    didParseCell: (d: any) => {
      if (d.section === 'body' && d.column.index === 2) {
        const status = d.cell.raw;
        if (status === 'Completed') d.cell.styles.textColor = [22, 163, 74];
        else if (status === 'In Transit') d.cell.styles.textColor = [217, 119, 6];
        else d.cell.styles.textColor = [29, 78, 216];
      }
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

// ── HTML email — ASC brand colours ────────────────────────────
// Primary: #D4560A (burnt orange)  Dark: #1A0800  Accent: #FF6B1A
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

  // ASC Brand colours
  const ORANGE  = '#D4560A';
  const DARK    = '#1A0800';
  const ORANGE2 = '#FF6B1A';
  const CREAM   = '#FFF8F3';
  const BORDER  = '#FFD4B8';

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${name}" style="height:48px;max-width:160px;object-fit:contain;"/>`
    : `<div style="display:inline-block;text-align:left;">
        <div style="color:${ORANGE};font-weight:900;font-size:20px;line-height:1;font-family:'Georgia',serif;">Alberta</div>
        <div style="color:${ORANGE};font-weight:900;font-size:20px;line-height:1;font-family:'Georgia',serif;">Safety</div>
        <div style="color:${ORANGE};font-weight:900;font-size:20px;line-height:1;font-family:'Georgia',serif;">Control</div>
       </div>`;

  const taskRows = tasks.slice(0,10).map(t=>`
    <tr style="border-bottom:1px solid #F0E8E0;">
      <td style="padding:10px 14px;font-size:13px;color:#1A0800;font-weight:600;">${t.contractor?.name||'—'}</td>
      <td style="padding:10px 14px;font-size:12px;color:#6B4A30;">${t.type}</td>
      <td style="padding:10px 14px;">
        <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
          background:${t.status==='Completed'?'#F0FDF4':t.status==='In Transit'?'#FFFBEB':'#FFF4EE'};
          color:${t.status==='Completed'?'#16A34A':t.status==='In Transit'?'#D97706':ORANGE};">
          ${t.status}
        </span>
      </td>
      <td style="padding:10px 14px;font-size:12px;color:#6B4A30;">
        ${t.completed_at?new Date(t.completed_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'}):'—'}
      </td>
    </tr>`).join('');

  const discrepRows = discrepancies.slice(0,8).map((r:any)=>`
    <tr style="border-bottom:1px solid #FEE2E2;background:#FFF5F5;">
      <td style="padding:9px 14px;font-size:12px;color:#1A0800;font-weight:600;">${r.task?.contractor?.name||'—'}</td>
      <td style="padding:9px 14px;font-size:12px;color:#6B4A30;">${r.item?.name||'—'}</td>
      <td style="padding:9px 14px;font-size:12px;font-weight:700;color:#D97706;text-align:center;">${r.quantity_damaged||0}</td>
      <td style="padding:9px 14px;font-size:12px;font-weight:700;color:#DC2626;text-align:center;">${r.quantity_missing||0}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${name} — Operations Report</title></head>
<body style="margin:0;padding:0;background:#F5EDE4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:640px;margin:28px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(80,20,0,0.15);">

  <!-- ═══ HEADER ═══ -->
  <div style="background:linear-gradient(135deg,${DARK} 0%,#2D1200 100%);padding:28px 36px;position:relative;overflow:hidden;">
    <!-- Decorative circles -->
    <div style="position:absolute;top:-50px;right:-50px;width:180px;height:180px;border-radius:50%;border:2px solid rgba(212,86,10,0.15);"></div>
    <div style="position:absolute;bottom:-30px;left:-30px;width:120px;height:120px;border-radius:50%;border:1px solid rgba(212,86,10,0.1);"></div>
    <!-- Orange accent line -->
    <div style="position:absolute;left:0;top:0;bottom:0;width:5px;background:linear-gradient(180deg,${ORANGE} 0%,${ORANGE2} 100%);"></div>

    <table style="width:100%;border-collapse:collapse;"><tr>
      <td style="vertical-align:middle;padding-left:8px;">${logoHtml}</td>
      <td style="text-align:right;vertical-align:top;">
        <div style="display:inline-block;background:${ORANGE};color:white;font-size:10px;font-weight:800;padding:5px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Operations Report</div><br/>
        <div style="color:white;font-size:14px;font-weight:700;">${period}</div>
      </td>
    </tr></table>

    <div style="margin-top:22px;padding-left:8px;">
      <div style="color:rgba(255,200,150,0.65);font-size:12px;margin-bottom:5px;font-style:italic;">Oilfield Safety Specialists</div>
      <div style="color:white;font-size:22px;font-weight:900;line-height:1.15;letter-spacing:-0.5px;">
        Field Operations<br/><span style="color:${ORANGE2};">Summary Report</span>
      </div>
    </div>
  </div>

  <!-- ═══ STATS BAND ═══ -->
  <div style="background:linear-gradient(135deg,${ORANGE} 0%,#B33D00 100%);">
    <table style="width:100%;border-collapse:collapse;"><tr>
      ${[{l:'Total Tasks',v:tasks.length,i:'📋'},{l:'Completed',v:completed,i:'✅'},{l:'Active',v:active,i:'⚡'},{l:'Workers',v:workers.length,i:'👷'}]
        .map(s=>`<td style="padding:16px 8px;text-align:center;border-right:1px solid rgba(255,255,255,0.15);">
          <div style="font-size:16px;margin-bottom:3px;">${s.i}</div>
          <div style="color:white;font-size:24px;font-weight:900;line-height:1;text-shadow:0 1px 3px rgba(0,0,0,0.2);">${s.v}</div>
          <div style="color:rgba(255,230,210,0.8);font-size:10px;margin-top:3px;text-transform:uppercase;letter-spacing:0.06em;">${s.l}</div>
        </td>`).join('')}
    </tr></table>
  </div>

  <!-- ═══ BODY ═══ -->
  <div style="padding:28px 36px;">

    <!-- Tasks -->
    <div style="margin-bottom:28px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:4px;height:20px;background:${ORANGE};border-radius:2px;"></div>
          <h2 style="margin:0;font-size:14px;font-weight:800;color:${DARK};text-transform:uppercase;letter-spacing:0.06em;">Task Activity</h2>
        </div>
        <span style="font-size:11px;color:#9A7060;font-weight:600;">${tasks.length} total · PDF attached</span>
      </div>
      <div style="border-radius:12px;overflow:hidden;border:1px solid #F0E8E0;box-shadow:0 1px 4px rgba(80,20,0,0.06);">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#FFF4EE;">
            ${['Contractor','Type','Status','Completed'].map(h=>`<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#9A5030;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #F0E0D0;">${h}</th>`).join('')}
          </tr></thead>
          <tbody>${taskRows||`<tr><td colspan="4" style="padding:20px;text-align:center;color:#9A7060;font-size:13px;font-style:italic;">No tasks in this period</td></tr>`}</tbody>
        </table>
        ${tasks.length>10?`<div style="padding:10px 14px;background:#FFF4EE;text-align:center;font-size:12px;color:#9A5030;border-top:1px solid #F0E0D0;font-style:italic;">+${tasks.length-10} more tasks — see attached PDF</div>`:''}
      </div>
    </div>

    <!-- Discrepancies -->
    ${hasD?`
    <div style="margin-bottom:28px;">
      <div style="background:#FEF2F2;border:2px solid #FECACA;border-radius:12px;padding:14px 18px;margin-bottom:14px;display:flex;align-items:center;gap:10px;">
        <div style="font-size:22px;">⚠️</div>
        <div>
          <div style="font-size:13px;font-weight:800;color:#DC2626;margin-bottom:2px;">Item Discrepancies Detected</div>
          <div style="font-size:12px;color:#B91C1C;">${discrepancies.length} item(s) with missing or damaged status</div>
        </div>
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

    <!-- PDF notice -->
    <div style="background:${CREAM};border:1px solid ${BORDER};border-radius:12px;padding:14px 18px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
      <div style="font-size:22px;">📎</div>
      <div>
        <div style="font-size:13px;font-weight:700;color:${DARK};margin-bottom:2px;">Full PDF Report Attached</div>
        <div style="font-size:12px;color:#9A5030;">Complete breakdown with all tasks and discrepancies attached as PDF.</div>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL||'https://fieldops.vercel.app'}/supervisor/dashboard"
        style="display:inline-block;background:linear-gradient(135deg,${ORANGE} 0%,#B33D00 100%);color:white;font-size:14px;font-weight:800;padding:14px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.02em;box-shadow:0 4px 16px rgba(212,86,10,0.35);">
        View Full Dashboard →
      </a>
    </div>
  </div>

  <!-- ═══ FOOTER ═══ -->
  <div style="background:${DARK};padding:22px 36px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <div style="width:3px;height:16px;background:${ORANGE};border-radius:2px;"></div>
      <div style="font-size:14px;font-weight:800;color:white;">${name}</div>
    </div>
    <div style="font-size:11px;color:rgba(255,200,150,0.6);line-height:1.8;">
      ${[email, phone, address, website].filter(Boolean).join(' &nbsp;·&nbsp; ')}
    </div>
    <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);font-size:10px;color:rgba(255,255,255,0.25);line-height:1.7;text-align:center;">
      This report was automatically generated by FieldOps &nbsp;·&nbsp; ${name}<br/>
      <em>"ALL Hours MUST be signed and authorized by supervisor before being sent in"</em>
    </div>
  </div>
</div>
</body></html>`;
}

// ── Send via provider ──────────────────────────────────────────
async function sendEmail(opts: {
  provider: string; settings: Record<string,string>;
  to: string[]; subject: string; html: string; pdfBuffer: Buffer | null;
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
          ...(pdfBuffer ? { Attachments: [{ ContentType: 'application/pdf', Filename: filename, Base64Content: pdfBuffer.toString('base64') }] } : {}),
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
        ...(pdfBuffer ? { attachments: [{ filename, content: pdfBuffer, contentType: 'application/pdf' }] } : {}),
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

    const sendPdf = s.send_pdf_attachment !== 'false';
    const [html, pdfBuffer] = await Promise.all([
      buildEmailHtml(payload),
      sendPdf ? generatePDF(payload) : Promise.resolve(null),
    ]);

    const result = await sendEmail({ provider, settings:s, to:recipients, subject, html, pdfBuffer: pdfBuffer as Buffer | null, period });

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

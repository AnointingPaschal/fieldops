import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Beautiful HTML email ───────────────────────────────────────
function buildEmailHtml(data: {
  period: string; tasks: any[]; workers: any[]; discrepancies: any[];
}): string {
  const { period, tasks, workers, discrepancies } = data;
  const completed  = tasks.filter(t => t.status === 'Completed').length;
  const active     = tasks.filter(t => !['Completed','Cancelled'].includes(t.status)).length;
  const hasDiscrep = discrepancies.length > 0;

  const taskRows = tasks.slice(0, 10).map(t => `
    <tr style="border-bottom:1px solid #E2E8F0;">
      <td style="padding:10px 16px;font-size:13px;color:#0F172A;font-weight:600;">${t.contractor?.name || '—'}</td>
      <td style="padding:10px 16px;font-size:12px;color:#64748B;">${t.type}</td>
      <td style="padding:10px 16px;">
        <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
          background:${t.status==='Completed'?'#F0FDF4':t.status==='In Transit'?'#FFFBEB':'#EFF6FF'};
          color:${t.status==='Completed'?'#16A34A':t.status==='In Transit'?'#D97706':'#1D4ED8'};">
          ${t.status}
        </span>
      </td>
      <td style="padding:10px 16px;font-size:12px;color:#64748B;">
        ${t.completed_at ? new Date(t.completed_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}
      </td>
    </tr>`).join('');

  const discrepRows = discrepancies.slice(0, 8).map((r: any) => `
    <tr style="border-bottom:1px solid #FEE2E2;background:#FFF5F5;">
      <td style="padding:9px 14px;font-size:12px;color:#0F172A;font-weight:600;">${r.task?.contractor?.name||'—'}</td>
      <td style="padding:9px 14px;font-size:12px;color:#475569;">${r.item?.name||'—'}</td>
      <td style="padding:9px 14px;font-size:12px;font-weight:700;color:#D97706;text-align:center;">${r.quantity_damaged||0}</td>
      <td style="padding:9px 14px;font-size:12px;font-weight:700;color:#DC2626;text-align:center;">${r.quantity_missing||0}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>FieldOps Report — Alberta Safety Control</title></head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:640px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">
  <!-- Header -->
  <div style="background:#0B1D35;padding:32px 40px;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;border:1px solid rgba(255,255,255,0.06);"></div>
    <div style="position:absolute;bottom:-40px;left:-40px;width:140px;height:140px;border-radius:50%;border:1px solid rgba(255,255,255,0.04);"></div>
    <table style="width:100%;border-collapse:collapse;"><tr>
      <td style="vertical-align:middle;">
        <div style="background:black;border-radius:8px;display:inline-block;padding:8px 12px;">
          <div style="color:#FF8C00;font-weight:900;font-size:14px;line-height:1.1;">Alberta</div>
          <div style="color:white;font-weight:800;font-size:12px;line-height:1.1;">Safety</div>
          <div style="color:white;font-weight:800;font-size:12px;line-height:1.1;">Control</div>
        </div>
      </td>
      <td style="text-align:right;vertical-align:middle;">
        <div style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Operations Report</div>
        <div style="color:white;font-size:15px;font-weight:800;">${period}</div>
      </td>
    </tr></table>
    <div style="margin-top:28px;">
      <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:6px;">Good day — here is your operations summary</div>
      <div style="color:white;font-size:22px;font-weight:900;line-height:1.2;">Field Operations<br/>Summary Report</div>
    </div>
  </div>
  <!-- Stats band -->
  <div style="background:#1D4ED8;">
    <table style="width:100%;border-collapse:collapse;"><tr>
      ${[{l:'Total Tasks',v:tasks.length,i:'📋'},{l:'Completed',v:completed,i:'✅'},{l:'Active',v:active,i:'⚡'},{l:'Workers',v:workers.length,i:'👷'}]
        .map(s=>`<td style="padding:18px 10px;text-align:center;border-right:1px solid rgba(255,255,255,0.1);">
          <div style="color:rgba(255,255,255,0.6);font-size:18px;margin-bottom:4px;">${s.i}</div>
          <div style="color:white;font-size:24px;font-weight:900;line-height:1;">${s.v}</div>
          <div style="color:rgba(255,255,255,0.55);font-size:10px;margin-top:4px;text-transform:uppercase;letter-spacing:0.05em;">${s.l}</div>
        </td>`).join('')}
    </tr></table>
  </div>
  <!-- Body -->
  <div style="padding:32px 40px;">
    <!-- Tasks -->
    <div style="margin-bottom:32px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h2 style="margin:0;font-size:15px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:0.05em;">Task Activity</h2>
        <span style="font-size:11px;color:#94A3B8;font-weight:600;">${tasks.length} total</span>
      </div>
      <div style="border-radius:12px;overflow:hidden;border:1px solid #E2E8F0;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#F8FAFC;">
            ${['Contractor','Type','Status','Completed'].map(h=>`<th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #E2E8F0;">${h}</th>`).join('')}
          </tr></thead>
          <tbody>${taskRows||'<tr><td colspan="4" style="padding:20px;text-align:center;color:#94A3B8;font-size:13px;">No tasks in this period</td></tr>'}</tbody>
        </table>
        ${tasks.length>10?`<div style="padding:12px 16px;background:#F8FAFC;text-align:center;font-size:12px;color:#64748B;border-top:1px solid #E2E8F0;">+${tasks.length-10} more tasks</div>`:''}
      </div>
    </div>
    <!-- Discrepancies -->
    ${hasDiscrep?`
    <div style="margin-bottom:32px;">
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
        <div style="font-size:24px;">⚠️</div>
        <div>
          <div style="font-size:13px;font-weight:800;color:#DC2626;margin-bottom:2px;">Item Discrepancies Detected</div>
          <div style="font-size:12px;color:#B91C1C;">${discrepancies.length} item(s) with missing or damaged status</div>
        </div>
      </div>
      <div style="border-radius:12px;overflow:hidden;border:1px solid #FECACA;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#FEF2F2;">
            ${['Contractor','Item','Damaged','Not Found'].map(h=>`<th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #FECACA;">${h}</th>`).join('')}
          </tr></thead>
          <tbody>${discrepRows}</tbody>
        </table>
      </div>
    </div>`:`
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px 20px;margin-bottom:32px;display:flex;align-items:center;gap:12px;">
      <div style="font-size:24px;">✅</div>
      <div style="font-size:13px;font-weight:700;color:#16A34A;">No item discrepancies — all equipment accounted for</div>
    </div>`}
    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL||'https://fieldops.vercel.app'}/supervisor/dashboard"
        style="display:inline-block;background:#0B1D35;color:white;font-size:14px;font-weight:800;padding:14px 36px;border-radius:12px;text-decoration:none;">
        View Full Dashboard →
      </a>
    </div>
  </div>
  <!-- Footer -->
  <div style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:24px 40px;text-align:center;">
    <div style="font-size:13px;font-weight:800;color:#0F172A;margin-bottom:4px;">Alberta Safety Control</div>
    <div style="font-size:11px;color:#94A3B8;margin-bottom:12px;">admin@albertasafetycontrol.com · www.albertasafetycontrol.com</div>
    <div style="font-size:10px;color:#CBD5E1;line-height:1.6;">
      This report was automatically generated by FieldOps.<br/>
      <em>"ALL Hours MUST be signed and authorized by supervisor before being sent in"</em>
    </div>
  </div>
</div>
</body></html>`;
}

// ── Send via provider ─────────────────────────────────────────
async function sendEmail(opts: {
  provider: string; settings: Record<string,string>;
  to: string[]; subject: string; html: string;
}) {
  const { provider, settings, to, subject, html } = opts;

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
        })),
      }),
    });
    if (!res.ok) throw new Error(`Mailjet error: ${await res.text()}`);
    return { sent: to.length };
  }

  if (provider === 'gmail') {
    const transporter = nodemailer.createTransport({
      host:   'smtp.gmail.com',
      port:    587,
      secure:  false,
      auth: {
        user: settings.gmail_email,
        pass: settings.gmail_app_password,
      },
    });
    for (const email of to) {
      await transporter.sendMail({
        from:    `"${settings.gmail_from_name||'Alberta Safety Control'}" <${settings.gmail_email}>`,
        to:      email,
        subject,
        html,
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

    // Fetch all settings
    const { data: rows } = await db.from('app_settings').select('key,value');
    const s: Record<string,string> = {};
    (rows||[]).forEach((r:any) => { s[r.key] = r.value; });

    const provider = s.active_email_provider || 'mailjet';

    // Validate provider credentials
    if (provider === 'mailjet' && (!s.mailjet_api_key || !s.mailjet_secret_key)) {
      return NextResponse.json({ error: 'Mailjet API keys not configured. Go to Settings.' }, { status: 400 });
    }
    if (provider === 'gmail' && (!s.gmail_email || !s.gmail_app_password)) {
      return NextResponse.json({ error: 'Gmail credentials not configured. Go to Settings.' }, { status: 400 });
    }

    // Fetch schedule + recipients
    const { data: schedule } = await db.from('report_schedules').select('*').order('updated_at',{ascending:false}).limit(1).maybeSingle();
    const recipients: string[] = isTest ? [body.testEmail].filter(Boolean) : (schedule?.recipients||[]);

    if (!recipients.length) {
      return NextResponse.json({ error: 'No recipients configured.' }, { status: 400 });
    }

    // Fetch report data
    const [{ data: tasks }, { data: workers }, { data: discrepancies }] = await Promise.all([
      db.from('tasks').select('*,contractor:contractors(name)').order('created_at',{ascending:false}).limit(50),
      db.from('profiles').select('id,name').eq('role','worker'),
      db.from('task_item_recovery').select('*,item:inventory_items(name),task:tasks(contractor:contractors(name))').or('quantity_damaged.gt.0,quantity_missing.gt.0'),
    ]);

    const period  = new Date().toLocaleDateString('en-CA',{month:'long',day:'numeric',year:'numeric'});
    const subject = isTest ? `[TEST] FieldOps Report — ${period}` : `FieldOps Operations Report — ${period}`;
    const html    = buildEmailHtml({ period, tasks:tasks||[], workers:workers||[], discrepancies:discrepancies||[] });

    const result = await sendEmail({ provider, settings: s, to: recipients, subject, html });

    if (!isTest && schedule) {
      const ms: Record<string,number> = { hours:3600000, days:86400000, weeks:604800000 };
      const nextMs = (schedule.frequency_value||1) * ms[schedule.frequency_unit||'weeks'];
      await db.from('report_schedules').update({
        last_sent_at: new Date().toISOString(),
        next_send_at: new Date(Date.now()+nextMs).toISOString(),
      }).eq('id', schedule.id);
    }

    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

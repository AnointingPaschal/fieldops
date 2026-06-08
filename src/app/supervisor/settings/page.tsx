'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Mail, User, CheckCircle, AlertCircle, Loader2,
  Send, Eye, EyeOff, Shield, Zap, Globe, Save,
  Radio,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchSettings, saveSettings, fetchCurrentUser } from '@/lib/api';
import type { Profile } from '@/types';

const ALL_KEYS = [
  'active_email_provider',
  'mailjet_api_key', 'mailjet_secret_key', 'mailjet_from_email', 'mailjet_from_name',
  'gmail_email', 'gmail_app_password', 'gmail_from_name',
];

type Provider = 'mailjet' | 'gmail';

function SecretInput({ label, hint, placeholder, value, onChange }: {
  label: string; hint?: string; placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="text-[11px] text-text-muted mb-1.5">{hint}</p>}
      <div className="relative">
        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input type={show ? 'text' : 'password'}
          className="input pl-10 pr-10 font-mono text-[13px]"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)} />
        <button onClick={() => setShow(s => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function TextField({ label, icon: Icon = Mail, type = 'text', hint, placeholder, value, onChange }: {
  label: string; icon?: any; type?: string; hint?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="text-[11px] text-text-muted mb-1.5">{hint}</p>}
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input type={type} className="input pl-10" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [user,     setUser]     = useState<Profile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [testing,  setTesting]  = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);
  const [testEmail,setTestEmail]= useState('');
  const [provider, setProvider] = useState<Provider>('mailjet');

  const [mj, setMj] = useState({ api_key:'', secret_key:'', from_email:'admin@albertasafetycontrol.com', from_name:'Alberta Safety Control' });
  const [gm, setGm] = useState({ email:'', app_password:'', from_name:'Alberta Safety Control' });

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [u, s] = await Promise.all([fetchCurrentUser(), fetchSettings(ALL_KEYS)]);
      setUser(u);
      if (s.active_email_provider) setProvider(s.active_email_provider as Provider);
      setMj({
        api_key:    s.mailjet_api_key    || '',
        secret_key: s.mailjet_secret_key || '',
        from_email: s.mailjet_from_email || 'admin@albertasafetycontrol.com',
        from_name:  s.mailjet_from_name  || 'Alberta Safety Control',
      });
      setGm({
        email:        s.gmail_email        || '',
        app_password: s.gmail_app_password || '',
        from_name:    s.gmail_from_name    || 'Alberta Safety Control',
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await saveSettings({
      active_email_provider: provider,
      mailjet_api_key:       mj.api_key,
      mailjet_secret_key:    mj.secret_key,
      mailjet_from_email:    mj.from_email,
      mailjet_from_name:     mj.from_name,
      gmail_email:           gm.email,
      gmail_app_password:    gm.app_password,
      gmail_from_name:       gm.from_name,
    });
    setSaving(false);
    if (error) { showToast('Failed to save.', false); return; }
    setSaved(true); showToast('Settings saved.');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    if (!testEmail) { showToast('Enter a test email.', false); return; }
    setTesting(true);
    // Save current settings first
    await saveSettings({
      active_email_provider: provider,
      mailjet_api_key: mj.api_key, mailjet_secret_key: mj.secret_key,
      mailjet_from_email: mj.from_email, mailjet_from_name: mj.from_name,
      gmail_email: gm.email, gmail_app_password: gm.app_password, gmail_from_name: gm.from_name,
    });
    const res  = await fetch('/api/send-report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true, testEmail }),
    });
    const json = await res.json();
    setTesting(false);
    if (res.ok) showToast(`Test email sent via ${provider === 'mailjet' ? 'Mailjet' : 'Gmail'} to ${testEmail}!`);
    else showToast(json.error || 'Failed to send.', false);
  };

  const mjConfigured = !!(mj.api_key && mj.secret_key);
  const gmConfigured = !!(gm.email && gm.app_password);

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="max-w-2xl space-y-5">

        <div>
          <h1 className="text-[15px] font-bold text-text-primary">Settings</h1>
          <p className="text-[11px] text-text-muted">Email integration and app preferences</p>
        </div>

        {/* ── Provider selector ── */}
        <div className="card space-y-4">
          <h2 className="font-bold text-[14px] text-text-primary">Active Email Provider</h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              {
                id: 'mailjet' as Provider,
                name: 'Mailjet',
                desc: 'Transactional email API',
                icon: Zap,
                color: '#1D4ED8',
                bg: '#EFF6FF',
                configured: mjConfigured,
              },
              {
                id: 'gmail' as Provider,
                name: 'Gmail SMTP',
                desc: 'Send via Gmail account',
                icon: Mail,
                color: '#DC2626',
                bg: '#FEF2F2',
                configured: gmConfigured,
              },
            ] as const).map(({ id, name, desc, icon: Icon, color, bg, configured }) => {
              const active = provider === id;
              return (
                <motion.button key={id} whileTap={{ scale: 0.98 }}
                  onClick={() => setProvider(id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    active ? '' : 'border-line bg-white hover:border-slate-300'
                  }`}
                  style={active ? { borderColor: color, background: bg } : {}}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: active ? color : bg }}>
                      <Icon className="w-4 h-4" style={{ color: active ? 'white' : color }} />
                    </div>
                    <div className="flex items-center gap-1">
                      {configured && <CheckCircle className="w-3.5 h-3.5 text-pass" />}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all`}
                        style={{ borderColor: active ? color : '#CBD5E1' }}>
                        {active && <div className="w-2 h-2 rounded-full" style={{ background: color }} />}
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-[13px]" style={{ color: active ? color : '#0F172A' }}>{name}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{desc}</p>
                  {active && (
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: color }}>ACTIVE</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skel h-14 rounded-xl"/>)}</div>
        ) : (
          <>
            {/* ── Mailjet settings ── */}
            <AnimatePresence mode="wait">
              {provider === 'mailjet' && (
                <motion.div key="mailjet" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:-8 }} className="card space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-line">
                    <div className="w-9 h-9 rounded-xl bg-sky/10 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-sky" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-bold text-[14px] text-text-primary">Mailjet Configuration</h2>
                      <p className="text-[11px] text-text-muted">API-based transactional email</p>
                    </div>
                    {mjConfigured && <span className="badge bg-pass/10 text-pass shrink-0"><CheckCircle className="w-3 h-3"/> Ready</span>}
                  </div>

                  <div className="bg-sky/5 border border-sky/20 rounded-xl p-3.5 flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-sky shrink-0 mt-0.5" />
                    <div className="text-[12px] text-text-secondary space-y-0.5">
                      <p className="font-bold text-text-primary">Get your API keys:</p>
                      <p>Go to <a href="https://app.mailjet.com/account/apikeys" target="_blank" rel="noopener noreferrer" className="text-sky font-semibold hover:underline">app.mailjet.com → Account → API Keys</a></p>
                    </div>
                  </div>

                  <SecretInput label="API Key (Public)" placeholder="Enter Mailjet API key"
                    hint="The public key from your Mailjet account"
                    value={mj.api_key} onChange={v => setMj(p=>({...p,api_key:v}))} />
                  <SecretInput label="Secret Key" placeholder="Enter Mailjet secret key"
                    hint="Keep this private — never share it"
                    value={mj.secret_key} onChange={v => setMj(p=>({...p,secret_key:v}))} />
                  <div className="grid grid-cols-2 gap-3">
                    <TextField label="From Email" icon={Mail} type="email"
                      placeholder="reports@company.com"
                      value={mj.from_email} onChange={v=>setMj(p=>({...p,from_email:v}))} />
                    <TextField label="From Name" icon={User}
                      placeholder="Alberta Safety Control"
                      value={mj.from_name} onChange={v=>setMj(p=>({...p,from_name:v}))} />
                  </div>
                </motion.div>
              )}

              {/* ── Gmail settings ── */}
              {provider === 'gmail' && (
                <motion.div key="gmail" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:-8 }} className="card space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-line">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-fail" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-bold text-[14px] text-text-primary">Gmail SMTP Configuration</h2>
                      <p className="text-[11px] text-text-muted">Send via your Google account</p>
                    </div>
                    {gmConfigured && <span className="badge bg-pass/10 text-pass shrink-0"><CheckCircle className="w-3 h-3"/> Ready</span>}
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-2">
                    <p className="text-[12px] font-bold text-fail flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Gmail App Password Required
                    </p>
                    <div className="text-[12px] text-red-700 space-y-1 leading-relaxed">
                      <p>1. Enable <strong>2-Step Verification</strong> on your Google account</p>
                      <p>2. Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="font-semibold underline">myaccount.google.com/apppasswords</a></p>
                      <p>3. Create an app password for "Mail" → copy the 16-character code</p>
                      <p>4. Paste it below — <strong>do not use your regular Gmail password</strong></p>
                    </div>
                  </div>

                  <TextField label="Gmail Address" icon={Mail} type="email"
                    placeholder="yourname@gmail.com"
                    hint="The Gmail account to send from"
                    value={gm.email} onChange={v=>setGm(p=>({...p,email:v}))} />
                  <SecretInput label="App Password" placeholder="xxxx xxxx xxxx xxxx"
                    hint="16-character app password from Google (not your Gmail password)"
                    value={gm.app_password} onChange={v=>setGm(p=>({...p,app_password:v}))} />
                  <TextField label="Display Name" icon={User}
                    placeholder="Alberta Safety Control"
                    value={gm.from_name} onChange={v=>setGm(p=>({...p,from_name:v}))} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save button */}
            <motion.button whileTap={{ scale:0.97 }} onClick={handleSave} disabled={saving}
              className="btn-navy w-full justify-center py-3.5 text-[14px] disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" />
                : saved ? <><CheckCircle className="w-4 h-4"/> Settings Saved</>
                : <><Save className="w-4 h-4"/> Save Settings</>}
            </motion.button>

            {/* Test send */}
            <div className="card space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-line">
                <div className="w-9 h-9 rounded-xl bg-warn/10 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-warn" />
                </div>
                <div>
                  <h2 className="font-bold text-[14px] text-text-primary">Send Test Report</h2>
                  <p className="text-[11px] text-text-muted">
                    Preview the email via <strong>{provider === 'mailjet' ? 'Mailjet' : 'Gmail SMTP'}</strong>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input type="email" className="input pl-10" placeholder="your@email.com"
                    value={testEmail} onChange={e => setTestEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTest()} />
                </div>
                <motion.button whileTap={{ scale:0.97 }} onClick={handleTest}
                  disabled={testing || (provider==='mailjet'?!mjConfigured:!gmConfigured)}
                  className="btn-navy shrink-0 disabled:opacity-40">
                  {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4"/> Test</>}
                </motion.button>
              </div>
              {((provider==='mailjet'&&!mjConfigured)||(provider==='gmail'&&!gmConfigured)) && (
                <p className="text-[11px] text-warn flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Configure and save {provider === 'mailjet' ? 'Mailjet' : 'Gmail'} credentials first.
                </p>
              )}
            </div>

            {/* App info */}
            <div className="card space-y-3">
              <div className="flex items-center gap-3 pb-4 border-b border-line">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-text-muted" />
                </div>
                <h2 className="font-bold text-[14px] text-text-primary">App Information</h2>
              </div>
              {[
                { k:'Version',   v:'1.0.0'                  },
                { k:'Stack',     v:'Next.js 14 · Supabase'  },
                { k:'Email',     v: provider==='mailjet'?'Mailjet API':'Gmail SMTP' },
                { k:'Maps',      v:'OpenStreetMap · Leaflet' },
                { k:'Real-time', v:'Supabase Realtime'       },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between py-2 border-b border-line last:border-0 text-[12px]">
                  <span className="font-semibold text-text-muted">{k}</span>
                  <span className="text-text-primary font-medium">{v}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
            className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-[13px] font-semibold z-[80] whitespace-nowrap ${toast.ok?'bg-pass':'bg-fail'}`}>
            {toast.ok?<CheckCircle className="w-4 h-4"/>:<AlertCircle className="w-4 h-4"/>}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Mail, User, CheckCircle, AlertCircle, Loader2,
  Send, Eye, EyeOff, Shield, Zap, Globe, Save,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchSettings, saveSettings, fetchCurrentUser } from '@/lib/api';
import type { Profile } from '@/types';

const SETTING_KEYS = ['mailjet_api_key','mailjet_secret_key','mailjet_from_email','mailjet_from_name'];

export default function SettingsPage() {
  const [user,       setUser]       = useState<Profile | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [testing,    setTesting]    = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [toast,      setToast]      = useState<{ msg:string; ok:boolean } | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [testEmail,  setTestEmail]  = useState('');

  const [keys, setKeys] = useState({
    mailjet_api_key:    '',
    mailjet_secret_key: '',
    mailjet_from_email: 'admin@albertasafetycontrol.com',
    mailjet_from_name:  'Alberta Safety Control',
  });

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [u, settings] = await Promise.all([fetchCurrentUser(), fetchSettings(SETTING_KEYS)]);
      setUser(u);
      setKeys(prev => ({ ...prev, ...settings }));
      if (u?.name) setTestEmail('');
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await saveSettings(keys as Record<string,string>);
    setSaving(false);
    if (error) { showToast('Failed to save settings.', false); return; }
    setSaved(true);
    showToast('Settings saved successfully.');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    if (!testEmail) { showToast('Enter a test email address.', false); return; }
    setTesting(true);
    const res  = await fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true, testEmail }),
    });
    const json = await res.json();
    setTesting(false);
    if (res.ok) showToast(`Test email sent to ${testEmail}!`);
    else showToast(json.error || 'Failed to send test email.', false);
  };

  const Field = ({ label, icon: Icon, value, onChange, type='text', placeholder='', hint='', secret=false }: any) => {
    const [show, setShow] = useState(false);
    return (
      <div>
        <label className="label">{label}</label>
        {hint && <p className="text-[11px] text-text-muted mb-2">{hint}</p>}
        <div className="relative">
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type={secret && !show ? 'password' : type}
            className="input pl-10 pr-10 font-mono text-[13px]"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
          {secret && (
            <button onClick={() => setShow(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppShell role="supervisor" userName={user?.name || 'Supervisor'}>
      <div className="max-w-2xl space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-[15px] font-bold text-text-primary">Settings</h1>
          <p className="text-[11px] text-text-muted">Configure integrations and preferences</p>
        </div>

        {/* Mailjet card */}
        <div className="card space-y-5">
          {/* Section header */}
          <div className="flex items-center gap-3 pb-4 border-b border-line">
            <div className="w-10 h-10 rounded-xl bg-sky/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-sky" />
            </div>
            <div>
              <h2 className="font-bold text-[14px] text-text-primary">Mailjet Email Integration</h2>
              <p className="text-[11px] text-text-muted">Used to send automated operations reports</p>
            </div>
            {keys.mailjet_api_key && keys.mailjet_secret_key && (
              <span className="badge bg-pass/10 text-pass ml-auto shrink-0">
                <CheckCircle className="w-3 h-3" /> Configured
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="skel h-12 rounded-xl"/>)}</div>
          ) : (
            <div className="space-y-4">

              {/* How to get keys */}
              <div className="bg-navy/5 border border-navy/15 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-4 h-4 text-navy shrink-0 mt-0.5" />
                <div className="text-[12px] text-text-secondary leading-relaxed space-y-1">
                  <p className="font-bold text-text-primary">How to get your Mailjet API keys:</p>
                  <p>1. Go to <a href="https://app.mailjet.com/account/apikeys" target="_blank" rel="noopener noreferrer" className="text-sky hover:underline font-semibold">app.mailjet.com → Account → API Keys</a></p>
                  <p>2. Copy your <strong>API Key</strong> (public) and <strong>Secret Key</strong></p>
                  <p>3. Paste them below and save — reports will be sent via your Mailjet account</p>
                </div>
              </div>

              <Field label="API Key (Public)" icon={Key}
                hint="Found in Mailjet → Account → API Keys"
                placeholder="your-mailjet-api-key"
                value={keys.mailjet_api_key}
                onChange={(v: string) => setKeys(p => ({ ...p, mailjet_api_key: v }))}
              />
              <Field label="Secret Key" icon={Key} secret
                hint="Keep this private — never share it"
                placeholder="your-mailjet-secret-key"
                value={keys.mailjet_secret_key}
                onChange={(v: string) => setKeys(p => ({ ...p, mailjet_secret_key: v }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <Field label="From Email" icon={Mail} type="email"
                  placeholder="reports@company.com"
                  value={keys.mailjet_from_email}
                  onChange={(v: string) => setKeys(p => ({ ...p, mailjet_from_email: v }))}
                />
                <Field label="From Name" icon={User}
                  placeholder="Alberta Safety Control"
                  value={keys.mailjet_from_name}
                  onChange={(v: string) => setKeys(p => ({ ...p, mailjet_from_name: v }))}
                />
              </div>

              <motion.button whileTap={{ scale:0.97 }} onClick={handleSave} disabled={saving}
                className="btn-navy w-full justify-center py-3 text-[14px] disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" />
                  : saved ? <><CheckCircle className="w-4 h-4" /> Saved</>
                  : <><Save className="w-4 h-4" /> Save Settings</>}
              </motion.button>
            </div>
          )}
        </div>

        {/* Test email card */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-line">
            <div className="w-10 h-10 rounded-xl bg-warn/10 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-warn" />
            </div>
            <div>
              <h2 className="font-bold text-[14px] text-text-primary">Send Test Report</h2>
              <p className="text-[11px] text-text-muted">Preview the report email before scheduling</p>
            </div>
          </div>

          <div>
            <label className="label">Test Recipient Email</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="email" className="input pl-10" placeholder="your@email.com"
                  value={testEmail} onChange={e => setTestEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTest()} />
              </div>
              <motion.button whileTap={{ scale:0.97 }} onClick={handleTest}
                disabled={testing || !keys.mailjet_api_key || !keys.mailjet_secret_key}
                className="btn-navy shrink-0 disabled:opacity-40">
                {testing
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Send className="w-4 h-4" /> Send Test</>}
              </motion.button>
            </div>
            {(!keys.mailjet_api_key || !keys.mailjet_secret_key) && (
              <p className="text-[11px] text-text-muted mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-warn" />
                Save your Mailjet API keys first to enable test sending.
              </p>
            )}
          </div>
        </div>

        {/* App info */}
        <div className="card space-y-3">
          <div className="flex items-center gap-3 pb-4 border-b border-line">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <h2 className="font-bold text-[14px] text-text-primary">App Information</h2>
              <p className="text-[11px] text-text-muted">FieldOps · Alberta Safety Control</p>
            </div>
          </div>
          <div className="space-y-2 text-[12px]">
            {[
              { k:'Version',     v:'1.0.0'                    },
              { k:'Stack',       v:'Next.js 14 · Supabase'    },
              { k:'Email',       v:'Mailjet'                   },
              { k:'Maps',        v:'OpenStreetMap · Leaflet'   },
              { k:'Real-time',   v:'Supabase Realtime'         },
            ].map(({ k, v }) => (
              <div key={k} className="flex justify-between py-2 border-b border-line last:border-0">
                <span className="font-semibold text-text-muted">{k}</span>
                <span className="text-text-primary font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
            className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-[13px] font-semibold z-[80] whitespace-nowrap ${toast.ok?'bg-pass':'bg-fail'}`}>
            {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Mail, User, CheckCircle, AlertCircle, Loader2, Send,
  Eye, EyeOff, Shield, Zap, Globe, Save, Building2,
  Phone, MapPin, ImagePlus, X,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchSettings, saveSettings, fetchCurrentUser, uploadCompanyLogo, COMPANY_KEYS } from '@/lib/api';
import type { Profile } from '@/types';

const EMAIL_KEYS = [
  'active_email_provider',
  'mailjet_api_key','mailjet_secret_key','mailjet_from_email','mailjet_from_name',
  'gmail_email','gmail_app_password','gmail_from_name',
];
const ALL_KEYS = [...EMAIL_KEYS, ...COMPANY_KEYS];

type Provider = 'mailjet'|'gmail';
type Tab = 'email'|'company';

function SecretField({ label, hint, placeholder, value, onChange }: any) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="text-[11px] text-text-muted mb-1.5">{hint}</p>}
      <div className="relative">
        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"/>
        <input type={show?'text':'password'} className="input pl-10 pr-10 font-mono text-[13px]"
          placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}/>
        <button onClick={()=>setShow(s=>!s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
          {show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
        </button>
      </div>
    </div>
  );
}

function Field({ label, icon:Icon=Mail, type='text', hint, placeholder, value, onChange }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="text-[11px] text-text-muted mb-1.5">{hint}</p>}
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"/>
        <input type={type} className="input pl-10" placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}/>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [user,      setUser]     = useState<Profile|null>(null);
  const [tab,       setTab]      = useState<Tab>('company');
  const [loading,   setLoading]  = useState(true);
  const [saving,    setSaving]   = useState(false);
  const [testing,   setTesting]  = useState(false);
  const [saved,     setSaved]    = useState(false);
  const [toast,     setToast]    = useState<{msg:string;ok:boolean}|null>(null);
  const [testEmail, setTestEmail]= useState('');
  const [provider,  setProvider] = useState<Provider>('mailjet');
  const [uploading, setUploading]= useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [mj, setMj] = useState({api_key:'',secret_key:'',from_email:'admin@albertasafetycontrol.com',from_name:'Alberta Safety Control'});
  const [gm, setGm] = useState({email:'',app_password:'',from_name:'Alberta Safety Control'});
  const [co, setCo] = useState({
    company_name:'Alberta Safety Control', company_tagline:'Field Operations Management',
    company_address:'', company_phone:'', company_email:'admin@albertasafetycontrol.com',
    company_website:'www.albertasafetycontrol.com', company_logo_url:'',
  });

  const showToast = (msg:string,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),4000);};

  useEffect(()=>{
    const load = async ()=>{
      setLoading(true);
      const [u,s] = await Promise.all([fetchCurrentUser(), fetchSettings(ALL_KEYS)]);
      setUser(u);
      if (s.active_email_provider) setProvider(s.active_email_provider as Provider);
      setMj({api_key:s.mailjet_api_key||'',secret_key:s.mailjet_secret_key||'',from_email:s.mailjet_from_email||'admin@albertasafetycontrol.com',from_name:s.mailjet_from_name||'Alberta Safety Control'});
      setGm({email:s.gmail_email||'',app_password:s.gmail_app_password||'',from_name:s.gmail_from_name||'Alberta Safety Control'});
      setCo(p=>({...p,
        company_name:    s.company_name    ||p.company_name,
        company_tagline: s.company_tagline ||p.company_tagline,
        company_address: s.company_address ||'',
        company_phone:   s.company_phone   ||'',
        company_email:   s.company_email   ||p.company_email,
        company_website: s.company_website ||p.company_website,
        company_logo_url:s.company_logo_url||'',
      }));
      setLoading(false);
    };
    load();
  },[]);

  const handleSave = async ()=>{
    setSaving(true);
    const {error} = await saveSettings({
      active_email_provider:provider,
      mailjet_api_key:mj.api_key, mailjet_secret_key:mj.secret_key,
      mailjet_from_email:mj.from_email, mailjet_from_name:mj.from_name,
      gmail_email:gm.email, gmail_app_password:gm.app_password, gmail_from_name:gm.from_name,
      ...co,
    });
    setSaving(false);
    if (error){showToast('Failed to save.',false);return;}
    setSaved(true); showToast('Settings saved.'); setTimeout(()=>setSaved(false),3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const f = e.target.files?.[0]; if(!f) return;
    setUploading(true);
    const url = await uploadCompanyLogo(f);
    setUploading(false);
    if (url) { setCo(p=>({...p,company_logo_url:url})); showToast('Logo uploaded!'); }
    else showToast('Logo upload failed.',false);
  };

  const handleTest = async ()=>{
    if (!testEmail){showToast('Enter a test email.',false);return;}
    setTesting(true);
    await saveSettings({active_email_provider:provider,mailjet_api_key:mj.api_key,mailjet_secret_key:mj.secret_key,mailjet_from_email:mj.from_email,mailjet_from_name:mj.from_name,gmail_email:gm.email,gmail_app_password:gm.app_password,gmail_from_name:gm.from_name,...co});
    const res = await fetch('/api/send-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({test:true,testEmail})});
    const json = await res.json();
    setTesting(false);
    if (res.ok) showToast(`Test sent via ${provider==='mailjet'?'Mailjet':'Gmail'} to ${testEmail}!`);
    else showToast(json.error||'Failed to send.',false);
  };

  const mjOk = !!(mj.api_key&&mj.secret_key);
  const gmOk = !!(gm.email&&gm.app_password);

  return (
    <AppShell role="supervisor" userName={user?.name||'Supervisor'}>
      <div className="max-w-2xl space-y-5">
        <div>
          <h1 className="text-[15px] font-bold text-text-primary">Settings</h1>
          <p className="text-[11px] text-text-muted">Company profile and email integration</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5">
          {([
            {id:'company',label:'Company Info'},
            {id:'email',  label:'Email Provider'},
          ] as const).map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={tab===t.id?'chip-on':'chip-off'}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="skel h-14 rounded-xl"/>)}</div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ── COMPANY INFO TAB ── */}
            {tab==='company' && (
              <motion.div key="company" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-4">
                <div className="card space-y-5">
                  <div className="flex items-center gap-3 pb-4 border-b border-line">
                    <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-navy"/>
                    </div>
                    <div>
                      <h2 className="font-bold text-[14px] text-text-primary">Company Profile</h2>
                      <p className="text-[11px] text-text-muted">Used in emails, PDFs and reports</p>
                    </div>
                  </div>

                  {/* Logo upload */}
                  <div>
                    <label className="label">Company Logo</label>
                    <div className="flex items-center gap-4">
                      {/* Preview */}
                      <div className="w-24 h-24 rounded-xl border-2 border-dashed border-line bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 relative group cursor-pointer"
                        onClick={()=>fileRef.current?.click()}>
                        {co.company_logo_url ? (
                          <>
                            <img src={co.company_logo_url} alt="logo" className="w-full h-full object-contain p-2"/>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImagePlus className="w-5 h-5 text-white"/>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-text-muted">
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin"/> : <ImagePlus className="w-5 h-5"/>}
                            <p className="text-[10px] font-medium text-center leading-tight">{uploading?'Uploading…':'Click to upload'}</p>
                          </div>
                        )}
                        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleLogoUpload}/>
                      </div>

                      <div className="flex-1 space-y-2">
                        <button onClick={()=>fileRef.current?.click()} disabled={uploading}
                          className="btn-ghost text-[12px] w-full justify-center">
                          {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin"/> Uploading…</>
                            : <><ImagePlus className="w-3.5 h-3.5"/> {co.company_logo_url?'Change Logo':'Upload Logo'}</>}
                        </button>
                        {co.company_logo_url && (
                          <button onClick={()=>setCo(p=>({...p,company_logo_url:''}))}
                            className="text-[11px] text-fail hover:underline flex items-center gap-1 justify-center w-full">
                            <X className="w-3 h-3"/> Remove
                          </button>
                        )}
                        <p className="text-[10px] text-text-muted text-center">PNG, JPG, SVG, WEBP · Max 2MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Field label="Company Name" icon={Building2} placeholder="Alberta Safety Control"
                        value={co.company_name} onChange={(v:string)=>setCo(p=>({...p,company_name:v}))}/>
                    </div>
                    <div className="col-span-2">
                      <Field label="Tagline / Description" icon={Globe} placeholder="Field Operations Management"
                        value={co.company_tagline} onChange={(v:string)=>setCo(p=>({...p,company_tagline:v}))}/>
                    </div>
                    <div>
                      <Field label="Email Address" icon={Mail} type="email" placeholder="admin@company.com"
                        value={co.company_email} onChange={(v:string)=>setCo(p=>({...p,company_email:v}))}/>
                    </div>
                    <div>
                      <Field label="Phone Number" icon={Phone} placeholder="+1 (403) 000-0000"
                        value={co.company_phone} onChange={(v:string)=>setCo(p=>({...p,company_phone:v}))}/>
                    </div>
                    <div>
                      <Field label="Website" icon={Globe} placeholder="www.company.com"
                        value={co.company_website} onChange={(v:string)=>setCo(p=>({...p,company_website:v}))}/>
                    </div>
                  </div>

                  <div>
                    <label className="label">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-text-muted"/>
                      <textarea className="textarea pl-10" rows={2} placeholder="5302 Forand St SW, Calgary, AB T3E 8B4"
                        value={co.company_address} onChange={e=>setCo(p=>({...p,company_address:e.target.value}))}/>
                    </div>
                  </div>
                </div>

                <motion.button whileTap={{scale:0.97}} onClick={handleSave} disabled={saving}
                  className="btn-navy w-full justify-center py-3.5 text-[14px] disabled:opacity-50">
                  {saving?<Loader2 className="w-4 h-4 animate-spin"/>
                    :saved?<><CheckCircle className="w-4 h-4"/>Saved</>
                    :<><Save className="w-4 h-4"/>Save Company Info</>}
                </motion.button>
              </motion.div>
            )}

            {/* ── EMAIL PROVIDER TAB ── */}
            {tab==='email' && (
              <motion.div key="email" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-4">

                {/* Provider selector */}
                <div className="card space-y-4">
                  <h2 className="font-bold text-[14px] text-text-primary">Active Email Provider</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      {id:'mailjet' as Provider, name:'Mailjet', desc:'Transactional email API', icon:Zap, color:'#1D4ED8', bg:'#EFF6FF', ok:mjOk},
                      {id:'gmail'   as Provider, name:'Gmail SMTP', desc:'Send via Gmail account', icon:Mail, color:'#DC2626', bg:'#FEF2F2', ok:gmOk},
                    ]).map(({id,name,desc,icon:Icon,color,bg,ok})=>{
                      const active = provider===id;
                      return (
                        <motion.button key={id} whileTap={{scale:0.98}} onClick={()=>setProvider(id)}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all ${active?'':'border-line bg-white hover:border-slate-300'}`}
                          style={active?{borderColor:color,background:bg}:{}}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:active?color:bg}}>
                              <Icon className="w-4 h-4" style={{color:active?'white':color}}/>
                            </div>
                            <div className="flex items-center gap-1">
                              {ok&&<CheckCircle className="w-3.5 h-3.5 text-pass"/>}
                              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{borderColor:active?color:'#CBD5E1'}}>
                                {active&&<div className="w-2 h-2 rounded-full" style={{background:color}}/>}
                              </div>
                            </div>
                          </div>
                          <p className="font-bold text-[13px]" style={{color:active?color:'#0F172A'}}>{name}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">{desc}</p>
                          {active&&<span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{background:color}}>ACTIVE</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Provider config */}
                <AnimatePresence mode="wait">
                  {provider==='mailjet'&&(
                    <motion.div key="mj" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} className="card space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-line">
                        <div className="w-9 h-9 rounded-xl bg-sky/10 flex items-center justify-center shrink-0"><Zap className="w-4 h-4 text-sky"/></div>
                        <div className="flex-1">
                          <h2 className="font-bold text-[14px] text-text-primary">Mailjet Configuration</h2>
                          <p className="text-[11px] text-text-muted">API-based transactional email</p>
                        </div>
                        {mjOk&&<span className="badge bg-pass/10 text-pass shrink-0"><CheckCircle className="w-3 h-3"/> Ready</span>}
                      </div>
                      <div className="bg-sky/5 border border-sky/20 rounded-xl p-3.5 flex items-start gap-2.5">
                        <Shield className="w-4 h-4 text-sky shrink-0 mt-0.5"/>
                        <p className="text-[12px] text-text-secondary">Get keys at <a href="https://app.mailjet.com/account/apikeys" target="_blank" rel="noopener noreferrer" className="text-sky font-semibold hover:underline">app.mailjet.com → Account → API Keys</a></p>
                      </div>
                      <SecretField label="API Key (Public)" placeholder="Enter Mailjet API key" hint="Public key from your Mailjet account" value={mj.api_key} onChange={(v:string)=>setMj(p=>({...p,api_key:v}))}/>
                      <SecretField label="Secret Key" placeholder="Enter Mailjet secret key" hint="Keep this private — never share it" value={mj.secret_key} onChange={(v:string)=>setMj(p=>({...p,secret_key:v}))}/>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="From Email" icon={Mail} type="email" placeholder="reports@company.com" value={mj.from_email} onChange={(v:string)=>setMj(p=>({...p,from_email:v}))}/>
                        <Field label="From Name" icon={User} placeholder="Alberta Safety Control" value={mj.from_name} onChange={(v:string)=>setMj(p=>({...p,from_name:v}))}/>
                      </div>
                    </motion.div>
                  )}
                  {provider==='gmail'&&(
                    <motion.div key="gm" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} className="card space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-line">
                        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-fail"/></div>
                        <div className="flex-1">
                          <h2 className="font-bold text-[14px] text-text-primary">Gmail SMTP Configuration</h2>
                          <p className="text-[11px] text-text-muted">Send via Google account</p>
                        </div>
                        {gmOk&&<span className="badge bg-pass/10 text-pass shrink-0"><CheckCircle className="w-3 h-3"/> Ready</span>}
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-1.5 text-[12px] text-red-700">
                        <p className="font-bold text-fail">Gmail App Password required:</p>
                        <p>1. Enable <strong>2-Step Verification</strong> on Google account</p>
                        <p>2. Visit <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="font-semibold underline">myaccount.google.com/apppasswords</a></p>
                        <p>3. Create password for "Mail" → paste 16-character code below</p>
                      </div>
                      <Field label="Gmail Address" icon={Mail} type="email" placeholder="yourname@gmail.com" value={gm.email} onChange={(v:string)=>setGm(p=>({...p,email:v}))}/>
                      <SecretField label="App Password" placeholder="xxxx xxxx xxxx xxxx" hint="16-character app password (not your Gmail password)" value={gm.app_password} onChange={(v:string)=>setGm(p=>({...p,app_password:v}))}/>
                      <Field label="Display Name" icon={User} placeholder="Alberta Safety Control" value={gm.from_name} onChange={(v:string)=>setGm(p=>({...p,from_name:v}))}/>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{scale:0.97}} onClick={handleSave} disabled={saving}
                  className="btn-navy w-full justify-center py-3.5 text-[14px] disabled:opacity-50">
                  {saving?<Loader2 className="w-4 h-4 animate-spin"/>:saved?<><CheckCircle className="w-4 h-4"/>Saved</>:<><Save className="w-4 h-4"/>Save Settings</>}
                </motion.button>

                {/* Test send */}
                <div className="card space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-line">
                    <div className="w-9 h-9 rounded-xl bg-warn/10 flex items-center justify-center shrink-0"><Send className="w-4 h-4 text-warn"/></div>
                    <div>
                      <h2 className="font-bold text-[14px] text-text-primary">Send Test Report</h2>
                      <p className="text-[11px] text-text-muted">Send a test with PDF via <strong>{provider==='mailjet'?'Mailjet':'Gmail SMTP'}</strong></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"/>
                      <input type="email" className="input pl-10" placeholder="your@email.com"
                        value={testEmail} onChange={e=>setTestEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleTest()}/>
                    </div>
                    <motion.button whileTap={{scale:0.97}} onClick={handleTest} disabled={testing||(provider==='mailjet'?!mjOk:!gmOk)} className="btn-navy shrink-0 disabled:opacity-40">
                      {testing?<Loader2 className="w-4 h-4 animate-spin"/>:<><Send className="w-4 h-4"/>Test</>}
                    </motion.button>
                  </div>
                </div>

                {/* App info */}
                <div className="card space-y-2">
                  <h2 className="font-bold text-[13px] text-text-primary pb-3 border-b border-line">App Information</h2>
                  {[{k:'Version',v:'1.0.0'},{k:'Stack',v:'Next.js 14 · Supabase'},{k:'Email',v:provider==='mailjet'?'Mailjet API':'Gmail SMTP'},{k:'Maps',v:'OpenStreetMap · Leaflet'},{k:'Real-time',v:'Supabase Realtime'}].map(({k,v})=>(
                    <div key={k} className="flex justify-between py-1.5 border-b border-line last:border-0 text-[12px]">
                      <span className="font-semibold text-text-muted">{k}</span>
                      <span className="text-text-primary font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {toast&&(
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}
            className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-[13px] font-semibold z-[80] whitespace-nowrap ${toast.ok?'bg-pass':'bg-fail'}`}>
            {toast.ok?<CheckCircle className="w-4 h-4"/>:<AlertCircle className="w-4 h-4"/>}{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

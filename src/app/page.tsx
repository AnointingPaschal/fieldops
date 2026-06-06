'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, ArrowRight, Briefcase, HardHat, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole]       = useState<'supervisor'|'worker'>('supervisor');
  const [email, setEmail]     = useState('');
  const [pw, setPw]           = useState('');
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    router.push(role === 'supervisor' ? '/supervisor/dashboard' : '/worker/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      {/* ─── Left panel (desktop) / top brand (mobile) ─── */}
      <div className="md:w-[45%] flex flex-col items-center justify-center px-10 py-14 relative overflow-hidden shrink-0">
        {/* Subtle geometric shapes */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full border border-white/5" />
        <div className="absolute top-1/3 left-[-40px] w-32 h-32 rounded-full border border-white/5" />

        <div className="relative z-10 max-w-xs text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-sky flex items-center justify-center mb-6 mx-auto md:mx-0">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">FieldOps</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Real-time field operations management for<br className="hidden md:block"/>
            <span className="font-semibold text-slate-300"> Alberta Safety Control</span>
          </p>
          <div className="hidden md:flex flex-col gap-3 text-sm text-slate-400">
            {['Task assignment & tracking','Real-time inventory management','Worker scheduling & timesheets','Automated weekly PDF reports'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-light shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right panel — form ─── */}
      <div className="flex-1 bg-bg flex items-center justify-center px-5 py-10 md:rounded-l-3xl">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-black text-text-primary mb-1">Sign In</h2>
          <p className="text-text-muted text-sm mb-8">Access your operations dashboard</p>

          {/* Role selector */}
          <div className="mb-6">
            <p className="label">Sign in as</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { v:'supervisor', l:'Supervisor',   I:Briefcase },
                { v:'worker',     l:'Field Worker',  I:HardHat  },
              ] as const).map(({ v, l, I }) => (
                <button key={v} onClick={() => setRole(v)}
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    role === v
                      ? 'border-navy bg-navy text-white'
                      : 'border-line bg-white text-text-secondary hover:border-slate-300'
                  }`}>
                  <I className="w-4 h-4 shrink-0" />
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="email" placeholder="you@albertasafety.ca"
                value={email} onChange={e => setEmail(e.target.value)}
                className="input pl-11" />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type={show ? 'text' : 'password'} placeholder="••••••••"
                value={pw} onChange={e => setPw(e.target.value)}
                className="input pl-11 pr-11" />
              <button onClick={() => setShow(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <button className="text-xs text-sky font-semibold hover:underline">Forgot password?</button>
          </div>

          <button onClick={go} disabled={loading}
            className="btn btn-navy btn-lg mb-4 disabled:opacity-50">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
          </button>

          <p className="text-center text-xs text-text-muted">
            Demo — click Sign In to enter as <strong className="text-text-secondary">{role}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

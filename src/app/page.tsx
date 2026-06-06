'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Briefcase, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'supervisor' | 'worker'>('supervisor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    router.push(role === 'supervisor' ? '/supervisor/dashboard' : '/worker/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #1A2744 0%, #0F1A2E 55%, #0F1A2E 100%)' }}>
      {/* Top hero - Stilex style */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center mb-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow mx-auto mb-5">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">FieldOps</h1>
          <p className="text-white/40 text-sm font-semibold uppercase tracking-widest mt-1">Alberta Safety Control</p>
          <p className="text-white/60 text-base mt-3">Real-time field operations platform</p>
        </div>

        {/* Role chips */}
        <div className="flex gap-3 mb-2">
          {([
            { value: 'supervisor', label: 'Supervisor',    Icon: Briefcase },
            { value: 'worker',     label: 'Field Worker',  Icon: User },
          ] as const).map(({ value, label, Icon }) => (
            <button key={value} onClick={() => setRole(value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-semibold text-sm transition-all ${
                role === value
                  ? 'border-primary bg-primary text-white shadow-glow'
                  : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom white card — slides up like a mobile sheet */}
      <div className="bg-white rounded-t-[2.5rem] px-7 pt-8 pb-10 shadow-navy">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-7" />

        <h2 className="text-2xl font-black text-text-primary mb-6">Sign In</h2>

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="email" placeholder="you@albertasafety.ca" value={email}
                onChange={e => setEmail(e.target.value)} className="input pl-11" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} className="input pl-11 pr-11" />
              <button onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="text-xs text-primary font-bold hover:underline">Forgot password?</button>
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2 text-[15px] py-4 rounded-2xl">
          {loading
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</span>
            : <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>}
        </button>

        <p className="text-center text-xs text-text-muted mt-4 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-info inline-block" />
          Demo — tap Sign In to continue as {role}
        </p>

        <p className="text-center text-[11px] text-text-muted mt-6">
          Powered by <span className="text-primary font-bold">JUSTIN Codes & Co</span>
        </p>
      </div>
    </div>
  );
}

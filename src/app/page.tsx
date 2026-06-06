'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, ArrowRight, Briefcase, HardHat } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'supervisor' | 'worker'>('supervisor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    router.push(role === 'supervisor' ? '/supervisor/dashboard' : '/worker/dashboard');
  };

  return (
    <div className="app-shell">
      {/* Navy top — 55% of screen */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1E2F47 0%, #0F1A2E 100%)', minHeight: '45vh' }}>
        {/* Decorative circles */}
        <div className="absolute top-[-60px] right-[-60px] w-52 h-52 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="absolute bottom-[-40px] left-[-40px] w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />

        <div className="relative z-10 text-center px-8">
          {/* Logo */}
          <div className="w-16 h-16 rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-glow"
            style={{ background: 'linear-gradient(135deg,#FF6B35,#FF9A00)' }}>
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">FieldOps</h1>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-1">Alberta Safety Control</p>

          {/* Role switcher pills */}
          <div className="flex gap-3 justify-center mt-7">
            {([
              { v: 'supervisor', l: 'Supervisor',  I: Briefcase },
              { v: 'worker',     l: 'Field Worker', I: HardHat },
            ] as const).map(({ v, l, I }) => (
              <button key={v} onClick={() => setRole(v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm transition-all ${
                  role === v
                    ? 'bg-primary border-primary text-white shadow-glow'
                    : 'border-white/20 text-white/50 hover:text-white/80'
                }`}>
                <I className="w-3.5 h-3.5" /> {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* White bottom sheet */}
      <div className="bg-white rounded-t-[2rem] -mt-6 px-6 pt-7 pb-10 shadow-navy flex-shrink-0">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-7" />

        <h2 className="text-2xl font-black text-text-primary mb-1">Welcome back</h2>
        <p className="text-text-muted text-sm mb-7">Sign in to your {role} account</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email</label>
            <input type="email" placeholder="you@albertasafety.ca" value={email}
              onChange={e => setEmail(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} className="input pr-12" />
              <button onClick={() => setShowPw(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="text-xs font-bold text-primary">Forgot password?</button>
          </div>
        </div>

        <button onClick={go} disabled={loading} className="btn-primary mb-4 shadow-glow">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
            : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
        </button>

        <p className="text-center text-xs text-text-muted">
          Demo — tap Sign In to enter as <span className="font-bold text-primary">{role}</span>
        </p>
      </div>
    </div>
  );
}

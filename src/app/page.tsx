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
    await new Promise(r => setTimeout(r, 1100));
    setLoading(false);
    router.push(role === 'supervisor' ? '/supervisor/dashboard' : '/worker/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-60px] w-[400px] h-[400px] rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute bottom-[-60px] left-[-40px] w-[320px] h-[320px] rounded-full bg-amber/8 blur-3xl" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{backgroundImage:'linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)',backgroundSize:'48px 48px'}} />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">FieldOps</h1>
            <p className="text-xs text-text-muted font-semibold uppercase tracking-widest mt-0.5">Alberta Safety Control</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-black text-text-primary tracking-tight mb-2">Welcome back</h2>
          <p className="text-text-secondary">Sign in to access your operations platform</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-3xl p-8 shadow-card-md animate-fade-in">
          {/* Role selector */}
          <div className="mb-6">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Sign in as</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'supervisor', label: 'Supervisor', Icon: Briefcase },
                { value: 'worker',     label: 'Field Worker', Icon: User },
              ] as const).map(({ value, label, Icon }) => (
                <button key={value} onClick={() => setRole(value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    role === value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-slate-50 text-text-secondary hover:border-slate-300'
                  }`}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="email" placeholder="you@albertasafety.ca" value={email}
                  onChange={e => setEmail(e.target.value)} className="input pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} className="input pl-11 pr-11" />
                <button onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="text-xs text-primary font-semibold hover:underline">Forgot password?</button>
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 text-base py-4">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
            )}
          </button>

          <p className="text-center text-xs text-text-muted mt-4 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-info inline-block" />
            Demo mode — tap Sign In to continue as {role}
          </p>
        </div>

        <p className="text-center text-xs text-text-muted mt-8">
          Powered by <span className="text-primary font-bold">JUSTIN Codes & Company</span> · v1.0.0
        </p>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowRight, Briefcase, HardHat, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [pw,       setPw]       = useState('');
  const [role,     setRole]     = useState<'supervisor'|'worker'>('supervisor');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const signIn = async () => {
    if (!email || !pw) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);

    if (authError) { setError(authError.message); return; }

    // Read role from profile
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single();

    const userRole = profile?.role || role;
    router.push(userRole === 'supervisor' ? '/supervisor/dashboard' : '/worker/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      {/* Left brand panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="md:w-[44%] flex flex-col justify-center px-8 py-12 relative overflow-hidden shrink-0"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full border border-white/5" />
          <div className="absolute bottom-[-80px] left-[-80px] w-64 h-64 rounded-full border border-white/5" />
        </div>
        <div className="relative max-w-xs">
          <div className="w-12 h-12 rounded-xl bg-sky flex items-center justify-center mb-5">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">FieldOps</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Alberta Safety Control — field operations management platform.
          </p>
          <div className="space-y-2.5 hidden md:block">
            {[
              'Task creation & real-time assignment',
              'Live inventory management',
              'Worker scheduling & availability',
              'Clock in/out with GPS',
              'Automated weekly timesheet reports',
            ].map(f => (
              <div key={f} className="flex items-center gap-2.5 text-[13px] text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-sky shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right form panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="flex-1 bg-bg md:rounded-l-3xl flex items-center justify-center px-5 py-10"
      >
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-black text-text-primary mb-0.5">Sign In</h2>
          <p className="text-text-muted text-sm mb-6">Access your operations dashboard</p>

          {/* Role selector */}
          <div className="mb-5">
            <label className="label">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { v:'supervisor', l:'Supervisor',   I:Briefcase },
                { v:'worker',     l:'Field Worker',  I:HardHat  },
              ] as const).map(({ v, l, I }) => (
                <button key={v} onClick={() => setRole(v)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                    role === v ? 'border-navy bg-navy text-white' : 'border-line bg-white text-text-secondary hover:border-slate-300'
                  }`}>
                  <I className="w-4 h-4 shrink-0" /> {l}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="email" placeholder="you@albertasafety.ca" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && signIn()}
                  className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={pw}
                  onChange={e => setPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && signIn()}
                  className="input pl-10 pr-10" />
                <button onClick={() => setShowPw(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
              className="flex items-center gap-2 text-fail text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="flex justify-end mb-4">
            <button className="text-[12px] text-sky font-semibold hover:underline">Forgot password?</button>
          </div>

          <button onClick={signIn} disabled={loading}
            className="btn btn-navy btn-full disabled:opacity-50">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
          </button>

          <p className="text-center text-[11px] text-text-muted mt-5">
            Don't have an account?{' '}
            <span className="text-sky font-semibold">Contact your administrator</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

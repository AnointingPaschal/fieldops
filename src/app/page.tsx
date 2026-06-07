'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowRight, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 6 + 6,
  delay: Math.random() * 4,
}));

export default function LoginPage() {
  const router  = useRouter();
  const [email,   setEmail]   = useState('');
  const [pw,      setPw]      = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const signIn = async () => {
    if (!email.trim() || !pw.trim()) { setError('Please enter your email and password.'); return; }
    setError(''); setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password: pw,
      });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (!authData.user) { setError('Login failed. Please try again.'); setLoading(false); return; }

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', authData.user.id).single();

      setSuccess(true);
      await new Promise(r => setTimeout(r, 800));
      router.push(profile?.role === 'supervisor' ? '/supervisor/dashboard' : '/worker/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Unexpected error.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#060D1A' }}>

      {/* ── Animated background particles ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              background: 'rgba(29,78,216,0.6)',
            }}
            animate={{ y: [0, -40, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Glowing orbs */}
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{ width: 500, height: 500, top: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(29,78,216,0.15) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{ width: 400, height: 400, bottom: '-5%', right: '-5%', background: 'radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{ width: 300, height: 300, top: '40%', right: '20%', background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ── Left: Branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex w-[52%] flex-col justify-between px-16 py-14 relative"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-10 h-10 rounded-xl bg-sky flex items-center justify-center shadow-lg"
          >
            <Shield className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <p className="font-black text-white text-lg leading-none tracking-tight">FieldOps</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Alberta Safety Control</p>
          </div>
        </div>

        {/* Center content */}
        <div className="max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="text-sky text-sm font-semibold uppercase tracking-widest mb-4">
              Field Operations Platform
            </p>
            <h1 className="text-5xl font-black text-white leading-tight tracking-tight mb-6">
              Manage your<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>
                field operations
              </span><br />
              in real time.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-10">
              Assign tasks, track inventory, manage worker schedules and
              automate timesheets — all from one platform.
            </p>
          </motion.div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              'Real-time task assignment & tracking',
              'Live inventory management with stock alerts',
              'Worker scheduling & availability control',
              'Automated weekly timesheet reports',
              'Clock in / out with GPS verification',
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-sky/20 border border-sky/40 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky" />
                </div>
                <p className="text-[13px] text-slate-400">{f}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-[11px] text-slate-600">
          © 2026 Alberta Safety Control · Confidential
        </p>
      </motion.div>

      {/* ── Right: Form ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-sky flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <p className="font-black text-white text-lg">FieldOps</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8 relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>

            {/* Card inner glow */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)' }} />

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Welcome back</h2>
              <p className="text-slate-500 text-sm mb-8">Sign in to your account</p>
            </motion.div>

            {/* Email */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="mb-4">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                focused === 'email' ? 'border-sky/60 shadow-[0_0_0_3px_rgba(29,78,216,0.1)]' : 'border-white/10'
              }`} style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  onKeyDown={e => e.key === 'Enter' && signIn()}
                  autoComplete="email"
                  className="w-full bg-transparent pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="mb-3">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                focused === 'pw' ? 'border-sky/60 shadow-[0_0_0_3px_rgba(29,78,216,0.1)]' : 'border-white/10'
              }`} style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  onFocus={() => setFocused('pw')}
                  onBlur={() => setFocused(null)}
                  onKeyDown={e => e.key === 'Enter' && signIn()}
                  autoComplete="current-password"
                  className="w-full bg-transparent pl-10 pr-11 py-3 text-white text-sm placeholder-slate-600 focus:outline-none"
                />
                <button onClick={() => setShowPw(s => !s)}
                  className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Forgot */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              className="flex justify-end mb-6">
              <button className="text-[12px] text-slate-500 hover:text-sky transition-colors">
                Forgot password?
              </button>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 text-red-400 text-[12px] rounded-xl px-3.5 py-3"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                    <CheckCircle className="w-4 h-4" />
                    Redirecting…
                  </motion.div>
                ) : (
                  <motion.button key="signin"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={signIn}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-[15px] disabled:opacity-60 transition-all relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }}
                  >
                    {/* Button shimmer */}
                    <motion.div
                      className="absolute inset-0 -skew-x-12"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                    />
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <p className="text-center text-[11px] text-slate-600 mt-6">
            Don&apos;t have an account?{' '}
            <span className="text-slate-400 font-semibold">Contact your administrator</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowRight, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      await new Promise(r => setTimeout(r, 700));
      router.push(profile?.role === 'supervisor' ? '/supervisor/dashboard' : '/worker/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Unexpected error.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg">

      {/* ── Left: Navy panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="hidden md:flex md:w-[44%] flex-col justify-between px-12 py-14 bg-navy relative overflow-hidden shrink-0"
      >
        {/* Decorative rings */}
        <div className="absolute top-[-120px] right-[-120px] w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute top-[-60px]  right-[-60px]  w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 rounded-full border border-white/5" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky flex items-center justify-center shadow-lg shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-black text-white text-[17px] leading-none tracking-tight">FieldOps</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Alberta Safety Control</p>
          </div>
        </div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="relative"
        >
          <p className="text-sky text-[11px] font-bold uppercase tracking-widest mb-4">
            Field Operations Platform
          </p>
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight mb-5">
            Run your field<br />operations with<br />
            <span className="text-sky">precision.</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Assign tasks, track inventory, manage worker schedules
            and automate timesheets — all from one platform.
          </p>

          <div className="space-y-3">
            {[
              'Real-time task assignment & tracking',
              'Live inventory with low-stock alerts',
              'Worker scheduling & availability',
              'Clock in / out with GPS verification',
              'Automated weekly timesheet PDF reports',
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07, duration: 0.35 }}
                className="flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-sky shrink-0" />
                <p className="text-[13px] text-slate-400">{f}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <p className="relative text-[11px] text-slate-600">
          © 2026 Alberta Safety Control · All rights reserved
        </p>
      </motion.div>

      {/* ── Right: Form panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center px-5 py-12"
      >
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <p className="font-black text-navy text-lg tracking-tight">FieldOps</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-black text-text-primary tracking-tight mb-1">Welcome back</h2>
            <p className="text-text-muted text-sm mb-8">Sign in to your account to continue</p>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-line shadow-card p-6 space-y-4"
          >
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <motion.div
                animate={{ boxShadow: focused === 'email' ? '0 0 0 3px rgba(29,78,216,0.12)' : '0 0 0 0px transparent' }}
                className="relative rounded-xl overflow-hidden"
              >
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  onKeyDown={e => e.key === 'Enter' && signIn()}
                  autoComplete="email"
                  className="input pl-10"
                />
              </motion.div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <motion.div
                animate={{ boxShadow: focused === 'pw' ? '0 0 0 3px rgba(29,78,216,0.12)' : '0 0 0 0px transparent' }}
                className="relative rounded-xl overflow-hidden"
              >
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  onFocus={() => setFocused('pw')}
                  onBlur={() => setFocused(null)}
                  onKeyDown={e => e.key === 'Enter' && signIn()}
                  autoComplete="current-password"
                  className="input pl-10 pr-11"
                />
                <button
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </motion.div>
            </div>

            <div className="flex justify-end">
              <button className="text-[12px] text-sky font-semibold hover:underline">
                Forgot password?
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-fail text-[12px] bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button */}
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-[15px] bg-pass"
                >
                  <CheckCircle className="w-4 h-4" /> Redirecting…
                </motion.div>
              ) : (
                <motion.button key="signin"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={signIn}
                  disabled={loading}
                  className="btn btn-navy btn-full disabled:opacity-50 text-[15px]"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          <p className="text-center text-[11px] text-text-muted mt-5">
            Don&apos;t have an account?{' '}
            <span className="text-navy font-semibold">Contact your administrator</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

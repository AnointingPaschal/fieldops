'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Eye, EyeOff, ArrowRight, Mail, Lock,
  AlertCircle, CheckCircle, Zap, Package, Users, Clock,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FEATURES = [
  { icon: Zap,     label: 'Real-time task assignment & tracking'      },
  { icon: Package, label: 'Live inventory with low-stock alerts'       },
  { icon: Users,   label: 'Worker scheduling & availability control'   },
  { icon: Clock,   label: 'Clock in/out · automated timesheet reports' },
];

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
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
      setSuccess(true);
      await new Promise(r => setTimeout(r, 700));
      router.push(profile?.role === 'supervisor' ? '/supervisor/dashboard' : '/worker/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Unexpected error.'); setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg overflow-hidden">

      {/* ── LEFT: Navy branding panel ── */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden lg:flex w-[46%] shrink-0 flex-col bg-navy relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage:'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize:'48px 48px' }} />
          <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full"
            style={{ background:'radial-gradient(circle, rgba(29,78,216,0.2) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full"
            style={{ background:'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)' }} />
        </div>

        {/* Content */}
        <div className="relative flex flex-col h-full px-12 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky flex items-center justify-center shadow-lg shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-[18px] leading-none">FieldOps</p>
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-0.5">Alberta Safety Control</p>
            </div>
          </div>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.5 }}>
              <p className="text-sky text-[11px] font-bold uppercase tracking-[0.18em] mb-5">
                — Field Operations Platform
              </p>
              <h1 className="text-[42px] font-black text-white leading-[1.1] tracking-tight mb-6">
                Operate smarter.<br />
                <span style={{ color:'rgba(96,165,250,1)' }}>Move faster.</span>
              </h1>
              <p className="text-white/40 text-[14px] leading-relaxed max-w-xs mb-10">
                Everything your team needs to manage field operations — in one clean, real-time platform.
              </p>
            </motion.div>

            {/* Features */}
            <div className="space-y-4">
              {FEATURES.map(({ icon: Icon, label }, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:-16 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <Icon className="w-4 h-4 text-sky" />
                  </div>
                  <p className="text-[13px] text-white/50">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom badge */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-pass animate-pulse" />
            <p className="text-[11px] text-white/25">Secured · Encrypted · Always available</p>
          </div>
        </div>
      </motion.div>

      {/* ── RIGHT: Form panel ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 relative">
        {/* Subtle top border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-navy" />

        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.45, delay:0.1, ease:'easeOut' }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <p className="font-black text-navy text-lg">FieldOps</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[28px] font-black text-text-primary tracking-tight leading-tight mb-2">
              Sign in to<br />your account
            </h2>
            <p className="text-text-muted text-sm">Enter your credentials to continue</p>
          </div>

          {/* Form */}
          <div className="space-y-4">

            {/* Email field */}
            <div>
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">
                Email Address
              </label>
              <motion.div animate={{
                boxShadow: focused === 'email'
                  ? '0 0 0 3px rgba(29,78,216,0.12), 0 1px 3px rgba(0,0,0,0.06)'
                  : '0 1px 3px rgba(0,0,0,0.06)',
              }} className="relative rounded-xl">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  onKeyDown={e => e.key === 'Enter' && signIn()}
                  autoComplete="email"
                  className="w-full bg-white border border-line rounded-xl pl-11 pr-4 py-3.5 text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-sky/50 transition-colors"
                />
              </motion.div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  Password
                </label>
                <button className="text-[11px] text-sky font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>
              <motion.div animate={{
                boxShadow: focused === 'pw'
                  ? '0 0 0 3px rgba(29,78,216,0.12), 0 1px 3px rgba(0,0,0,0.06)'
                  : '0 1px 3px rgba(0,0,0,0.06)',
              }} className="relative rounded-xl">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  onFocus={() => setFocused('pw')}
                  onBlur={() => setFocused(null)}
                  onKeyDown={e => e.key === 'Enter' && signIn()}
                  autoComplete="current-password"
                  className="w-full bg-white border border-line rounded-xl pl-11 pr-12 py-3.5 text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-sky/50 transition-colors"
                />
                <button
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </motion.div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity:0, y:-6, height:0 }}
                  animate={{ opacity:1, y:0, height:'auto' }}
                  exit={{ opacity:0, height:0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 text-fail text-[12px] bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div className="pt-1">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div key="ok"
                    initial={{ opacity:0, scale:0.97 }}
                    animate={{ opacity:1, scale:1 }}
                    className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white bg-pass"
                  >
                    <CheckCircle className="w-4 h-4" /> Redirecting…
                  </motion.div>
                ) : (
                  <motion.button key="btn"
                    whileHover={{ scale: 1.01, boxShadow:'0 8px 24px rgba(11,29,53,0.35)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={signIn}
                    disabled={loading}
                    className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-[15px] bg-navy hover:bg-navy-light disabled:opacity-50 transition-all"
                  >
                    {loading
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                    }
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-line" />
            <p className="text-[11px] text-text-muted">Alberta Safety Control</p>
            <div className="flex-1 h-px bg-line" />
          </div>

          <p className="text-center text-[12px] text-text-muted">
            Need access?{' '}
            <span className="text-navy font-bold">Contact your operations supervisor</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

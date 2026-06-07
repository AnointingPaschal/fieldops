'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';
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

  const signIn = async () => {
    if (!email.trim() || !pw.trim()) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password: pw,
      });
      if (authError) { setError('Invalid email or password.'); setLoading(false); return; }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).single();
      router.push(profile?.role === 'supervisor' ? '/supervisor/dashboard' : '/worker/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1D35] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(29,78,216,0.25) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full -translate-y-1/2 -translate-x-1/2"
          style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-[420px]"
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 rounded-3xl blur-2xl opacity-20"
          style={{ background: 'linear-gradient(135deg, #1D4ED8, #0B1D35)', transform: 'scale(1.05)' }} />

        <div className="relative bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-xl">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-sky flex items-center justify-center shadow-lg shadow-sky/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-lg leading-none tracking-tight">FieldOps</p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5 font-medium">Alberta Safety Control</p>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mb-7"
          >
            <h1 className="text-2xl font-black text-white tracking-tight mb-1">Welcome back</h1>
            <p className="text-white/40 text-sm">Sign in to your operations dashboard</p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="space-y-3"
          >
            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && signIn()}
                  autoComplete="email"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3.5 pl-11
                    text-white text-sm placeholder-white/25
                    focus:outline-none focus:border-sky/60 focus:bg-white/[0.08]
                    transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Password"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && signIn()}
                  autoComplete="current-password"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3.5 pl-11 pr-11
                    text-white text-sm placeholder-white/25
                    focus:outline-none focus:border-sky/60 focus:bg-white/[0.08]
                    transition-all duration-200"
                />
                <button onClick={() => setShowPw(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-300 text-[12px]">{error}</p>
              </motion.div>
            )}

            {/* Forgot */}
            <div className="flex justify-end">
              <button className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={signIn}
              disabled={loading}
              className="w-full relative overflow-hidden rounded-xl py-3.5 font-bold text-[15px] text-white
                flex items-center justify-center gap-2 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)' }}
            >
              {/* Button shimmer */}
              {!loading && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)' }} />
              )}
              <span className="relative">
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                  : <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>}
              </span>
            </motion.button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-[11px] text-white/20 mt-7"
          >
            Access restricted to authorised personnel only
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

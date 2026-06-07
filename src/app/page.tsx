'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield, Eye, EyeOff, ArrowRight,
  Briefcase, HardHat, Mail, Lock, AlertCircle,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Create client inline so env vars are read at runtime in the browser
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [email,   setEmail]   = useState('');
  const [pw,      setPw]      = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const signIn = async () => {
    if (!email.trim() || !pw.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Sign in
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: pw,
        });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Get role from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        // Profile missing — default to supervisor if email matches
        setError(`Signed in but profile not found (${profileError?.message}). Contact admin.`);
        setLoading(false);
        return;
      }

      // Navigate based on role
      if (profile.role === 'supervisor') {
        router.push('/supervisor/dashboard');
      } else {
        router.push('/worker/dashboard');
      }

    } catch (e: any) {
      setError(e?.message || 'Unexpected error. Check console.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">

      {/* ── Left panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="md:w-[42%] flex flex-col justify-center px-8 py-14 relative overflow-hidden shrink-0"
      >
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full border border-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full border border-white/5" />

        <div className="relative max-w-xs">
          <div className="w-11 h-11 rounded-xl bg-sky flex items-center justify-center mb-5">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">FieldOps</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Alberta Safety Control — field operations management platform.
          </p>
          <div className="space-y-2.5 hidden md:block">
            {[
              'Task creation & real-time assignment',
              'Live inventory management',
              'Worker scheduling & availability',
              'Clock in/out with GPS tracking',
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

      {/* ── Right form panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex-1 bg-bg md:rounded-l-3xl flex items-center justify-center px-5 py-10"
      >
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-black text-text-primary mb-0.5">Sign In</h2>
          <p className="text-text-muted text-sm mb-7">Access your operations dashboard</p>

          {/* Email */}
          <div className="mb-4">
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                placeholder="you@albertasafety.ca"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && signIn()}
                className="input pl-10"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={pw}
                onChange={e => setPw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && signIn()}
                className="input pl-10 pr-10"
                autoComplete="current-password"
              />
              <button
                onClick={() => setShowPw(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 text-fail text-[12px] bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="flex justify-end mb-5">
            <button className="text-[12px] text-sky font-semibold hover:underline">
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={signIn}
            disabled={loading}
            className="btn btn-navy btn-full disabled:opacity-50 mb-5"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <p className="text-center text-[11px] text-text-muted">
            Don&apos;t have an account?{' '}
            <span className="text-sky font-semibold">Contact your administrator</span>
          </p>

          {/* Debug helper — remove after confirming login works */}
          <div className="mt-6 p-3 bg-slate-100 rounded-lg text-[10px] text-text-muted space-y-1">
            <p className="font-bold text-text-secondary">Supabase connected to:</p>
            <p className="font-mono break-all">{process.env.NEXT_PUBLIC_SUPABASE_URL || '⚠️ URL not set'}</p>
            <p className="font-bold text-text-secondary mt-1">Anon key:</p>
            <p className="font-mono">{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ set' : '⚠️ not set'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

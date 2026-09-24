'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Unable to send reset instructions.');
      return;
    }

    setMessage(data.message || 'Check your email for reset instructions.');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-[0_20px_60px_rgba(49,65,130,0.1)]">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <span className="relative block h-10 w-10 shrink-0">
              <span className="absolute left-1 top-0 h-3 w-8 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
              <span className="absolute left-1 top-0 h-9 w-3 rounded-full bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-500" />
            </span>
            <span className="text-xl font-black text-slate-950">PAPrez</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-950">Forgot password?</h1>
            <p className="mt-2 text-slate-600 text-sm">Enter your email and we'll send you reset instructions</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition" 
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3">
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {message && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3">
                <p className="text-sm text-emerald-700 font-medium">{message}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.3)] hover:shadow-[0_16px_32px_rgba(37,99,235,0.4)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center">
              Remember your password?{' '}
              <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

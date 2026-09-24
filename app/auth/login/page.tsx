'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type RoleType = 'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_AGENT' | 'ADMIN';

const ROLE_PROFILES: Record<
  RoleType,
  {
    label: string;
    icon: string;
    description: string;
    demoEmail: string;
    demoPass: string;
    targetRoute: string;
    badgeColor: string;
  }
> = {
  CUSTOMER: {
    label: 'Customer',
    icon: '👤',
    description: 'Upload files & track print orders',
    demoEmail: 'customer@paprez.com',
    demoPass: 'DemoPass123',
    targetRoute: '/dashboard/customer',
    badgeColor: 'border-blue-500 bg-blue-50 text-blue-700'
  },
  SHOP_OWNER: {
    label: 'Shop Owner',
    icon: '🏪',
    description: 'Manage counter queue & spool prints',
    demoEmail: 'owner@paprez.com',
    demoPass: 'DemoPass123',
    targetRoute: '/dashboard/print-shop',
    badgeColor: 'border-indigo-500 bg-indigo-50 text-indigo-700'
  },
  DELIVERY_AGENT: {
    label: 'Delivery Agent',
    icon: '🚚',
    description: 'Deliver print orders with OTP',
    demoEmail: 'agent@paprez.com',
    demoPass: 'DemoPass123',
    targetRoute: '/dashboard/delivery',
    badgeColor: 'border-amber-500 bg-amber-50 text-amber-800'
  },
  ADMIN: {
    label: 'Admin',
    icon: '🛡️',
    description: 'Platform supervision & shop controls',
    demoEmail: 'admin@paprez.com',
    demoPass: 'DemoPass123',
    targetRoute: '/dashboard/admin',
    badgeColor: 'border-purple-500 bg-purple-50 text-purple-700'
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>('CUSTOMER');
  const [email, setEmail] = useState('customer@paprez.com');
  const [password, setPassword] = useState('DemoPass123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSelectRole(role: RoleType) {
    setSelectedRole(role);
    setEmail(ROLE_PROFILES[role].demoEmail);
    setPassword(ROLE_PROFILES[role].demoPass);
    setError('');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check credentials.');
        return;
      }

      localStorage.setItem('paprez_token', data.token);
      localStorage.setItem('paprez_user', JSON.stringify(data.user));

      // Set client cookies for 1 year persistence
      document.cookie = `paprez_token=${data.token}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `paprez_user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=31536000; SameSite=Lax`;

      const userRole = (data.user.role as RoleType) || selectedRole;
      const targetRoute = ROLE_PROFILES[userRole]?.targetRoute || '/dashboard/customer';
      router.push(targetRoute);
    } catch (err: any) {
      setLoading(false);
      setError('Network error. Please try again.');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-6 sm:p-8 shadow-[0_20px_60px_rgba(49,65,130,0.08)]">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                P
              </span>
              <span className="text-xl font-black text-slate-950">PAPrez</span>
            </Link>

            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Terminal Login
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Select Your Role & Sign In</h1>
            <p className="mt-1 text-slate-600 text-xs sm:text-sm">Choose how you are accessing the PAPREZ system today</p>
          </div>

          {/* Role Selection Grid */}
          <div className="mb-6">
            <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">Login as:</label>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(ROLE_PROFILES) as RoleType[]).map((role) => {
                const isSelected = selectedRole === role;
                const profile = ROLE_PROFILES[role];

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? `border-2 ${profile.badgeColor} shadow-sm ring-2 ring-blue-500/10`
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xl">{profile.icon}</span>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="font-black text-xs text-slate-950">{profile.label}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{profile.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demo Quick Fill Banner */}
          <div className="mb-5 p-3 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
            <div className="min-w-0 flex-1 pr-2">
              <p className="font-bold text-blue-900 truncate">
                Role: <strong>{ROLE_PROFILES[selectedRole].label}</strong>
              </p>
              <p className="text-[11px] text-blue-700">Pre-filled with verified credentials</p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectRole(selectedRole)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] shrink-0 shadow-sm"
            >
              Reset Credentials
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3">
                <p className="text-xs text-rose-700 font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_12px_24px_rgba(79,70,229,0.25)] hover:shadow-[0_16px_32px_rgba(79,70,229,0.35)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : `Sign in as ${ROLE_PROFILES[selectedRole].label} →`}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>New print shop or customer?</span>
            <Link href={`/auth/signup?role=${selectedRole}`} className="font-extrabold text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

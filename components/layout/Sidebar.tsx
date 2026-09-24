'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
  role: string;
}

const navItems = {
  CUSTOMER: [
    { href: '/dashboard/customer', label: '🏪 Nearby Shops & Orders', icon: '🏪' },
    { href: '/', label: '🏠 Homepage', icon: '🏠' }
  ],
  SHOP_OWNER: [
    { href: '/dashboard/print-shop', label: '⚡ Live Counter Queue', icon: '⚡' },
    { href: '/shop/abc-xerox', label: '👁️ View Customer Counter', icon: '👁️' },
    { href: '/', label: '🏠 Homepage', icon: '🏠' }
  ],
  DELIVERY_AGENT: [
    { href: '/dashboard/delivery', label: '🚚 Assigned Deliveries', icon: '🚚' },
    { href: '/', label: '🏠 Homepage', icon: '🏠' }
  ],
  ADMIN: [
    { href: '/dashboard/admin', label: '🛡️ Shops & Verification', icon: '🛡️' },
    { href: '/', label: '🏠 Homepage', icon: '🏠' }
  ]
};

export function Sidebar({ role }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('paprez_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}

    localStorage.removeItem('paprez_token');
    localStorage.removeItem('paprez_user');
    document.cookie = 'paprez_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    router.push('/auth/login');
  }

  const items = navItems[role as keyof typeof navItems] ?? navItems.CUSTOMER;

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col justify-between rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm xl:flex backdrop-blur">
        <div className="space-y-6">
          {/* Logo & Platform Brand */}
          <Link href="/" className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
              P
            </span>
            <div>
              <span className="block text-xl font-black text-slate-950 leading-none">PAPrez</span>
              <span className="block text-[11px] font-semibold text-slate-500 mt-0.5">Smart Printing</span>
            </div>
          </Link>

          {/* User Role Tag */}
          <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200/80">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Logged In As</p>
            <p className="text-xs font-black text-blue-600 mt-0.5">{role}</p>
          </div>

          {/* Nav Links */}
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-2">Navigation</p>
            <nav className="space-y-1.5">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card & Logout Button */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <span className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black text-xs">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Active User'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || ''}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs border border-rose-200 transition shadow-sm"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR NAVIGATION / LOGOUT */}
      <div className="xl:hidden w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm mb-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm">
            P
          </span>
          <span className="font-black text-slate-900 text-base">PAPrez</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
            {role}
          </span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}

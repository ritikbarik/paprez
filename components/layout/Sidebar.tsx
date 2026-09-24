'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    document.cookie = 'paprez_user=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    router.push('/auth/login');
  }

  // Cross-portal navigation items accessible to any user
  const mainPortals = [
    {
      href: '/dashboard/customer',
      label: 'Customer Hub & Orders',
      icon: '🧑',
      sublabel: 'Find shops, upload & track'
    },
    {
      href: '/dashboard/print-shop',
      label: 'Print Shop Terminal',
      icon: '⚡',
      sublabel: 'Live queue, counter & printers'
    },
    {
      href: '/shop/abc-xerox',
      label: 'Direct Shop Counter',
      icon: '👁️',
      sublabel: 'Customer ordering view'
    },
    {
      href: '/',
      label: 'Homepage',
      icon: '🏠',
      sublabel: 'Platform landing page'
    }
  ];

  if (role === 'ADMIN' || user?.role === 'ADMIN') {
    mainPortals.push({
      href: '/dashboard/admin',
      label: 'Admin Control Hub',
      icon: '🛡️',
      sublabel: 'Verify shops & users'
    });
  }

  if (role === 'DELIVERY_AGENT' || user?.role === 'DELIVERY_AGENT') {
    mainPortals.push({
      href: '/dashboard/delivery',
      label: 'Delivery Terminal',
      icon: '🚚',
      sublabel: 'Assigned delivery packages'
    });
  }

  const isCustomerPage = pathname.includes('/dashboard/customer');
  const isShopTerminal = pathname.includes('/dashboard/print-shop');

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col justify-between rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm xl:flex backdrop-blur">
        <div className="space-y-5 overflow-y-auto pr-1">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              P
            </span>
            <div>
              <span className="block text-xl font-black text-slate-950 leading-none">PAPrez</span>
              <span className="block text-[11px] font-semibold text-slate-500 mt-0.5">Smart Printing Network</span>
            </div>
          </Link>

          {/* User Role Tag */}
          <div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Account Role</p>
              <p className="text-xs font-black text-blue-600 mt-0.5">{user?.role || role}</p>
            </div>
            <span className="text-lg">✨</span>
          </div>

          {/* Quick Cross-Portal Switcher Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider mb-2">Switch View</p>
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href="/dashboard/customer"
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition text-center ${
                  isCustomerPage
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-white/80 border border-slate-200/60'
                }`}
              >
                <span className="text-sm">🧑</span>
                <span>Customer</span>
              </Link>
              <Link
                href="/dashboard/print-shop"
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition text-center ${
                  isShopTerminal
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-white/80 border border-slate-200/60'
                }`}
              >
                <span className="text-sm">⚡</span>
                <span>Shop Terminal</span>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-2">All Portals</p>
            <nav className="space-y-1">
              {mainPortals.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-start gap-2.5 rounded-2xl px-3 py-2.5 text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="leading-tight">{item.label}</div>
                      <div
                        className={`text-[10px] font-normal truncate mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card & Logout Button */}
        <div className="pt-3 border-t border-slate-200 space-y-2.5">
          <div className="flex items-center gap-2.5 px-1">
            <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
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
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition shadow-sm"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MOBILE TOP BAR NAVIGATION ================= */}
      <div className="xl:hidden w-full flex flex-col rounded-2xl bg-white border border-slate-200 shadow-sm mb-4">
        <div className="flex items-center justify-between p-3.5">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
              P
            </span>
            <span className="font-black text-slate-900 text-base">PAPrez</span>
          </Link>

          {/* Quick Cross-Portal Switch Button on Mobile */}
          <div className="flex items-center gap-1.5">
            {isShopTerminal ? (
              <Link
                href="/dashboard/customer"
                className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <span>🧑</span>
                <span>Customer View</span>
              </Link>
            ) : (
              <Link
                href="/dashboard/print-shop"
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <span>⚡</span>
                <span>Shop Terminal</span>
              </Link>
            )}

            {/* Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-black"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>

            {/* Quick Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs"
              title="Sign Out"
            >
              🚪
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 p-3 bg-slate-50/80 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Jump to Page</p>
            <div className="grid grid-cols-2 gap-2">
              {mainPortals.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-semibold">Logged in: {user?.name || role}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-rose-600 font-bold hover:underline"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MOBILE BOTTOM STICKY BAR ================= */}
      {/* Allows instant 1-tap switching anywhere on phones without feeling stuck */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center p-1 rounded-xl text-[10px] font-bold ${
            pathname === '/' ? 'text-blue-600' : 'text-slate-600'
          }`}
        >
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </Link>

        <Link
          href="/dashboard/customer"
          className={`flex flex-col items-center justify-center p-1 rounded-xl text-[10px] font-bold ${
            isCustomerPage ? 'text-blue-600 font-extrabold' : 'text-slate-600'
          }`}
        >
          <span className="text-lg">🧑</span>
          <span>Customer</span>
        </Link>

        <Link
          href="/dashboard/print-shop"
          className={`flex flex-col items-center justify-center p-1 rounded-xl text-[10px] font-bold ${
            isShopTerminal ? 'text-blue-600 font-extrabold' : 'text-slate-600'
          }`}
        >
          <span className="text-lg">⚡</span>
          <span>Shop</span>
        </Link>

        <Link
          href="/shop/abc-xerox"
          className={`flex flex-col items-center justify-center p-1 rounded-xl text-[10px] font-bold ${
            pathname.startsWith('/shop') ? 'text-blue-600 font-extrabold' : 'text-slate-600'
          }`}
        >
          <span className="text-lg">👁️</span>
          <span>Counter</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center justify-center p-1 rounded-xl text-[10px] font-bold text-rose-600"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
}

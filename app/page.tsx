'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const trustItems = [
  { title: 'Secure', text: 'Payments', icon: 'shield', color: 'text-blue-600' },
  { title: 'Clear', text: 'Instructions', icon: 'doc', color: 'text-indigo-600' },
  { title: 'Fast', text: 'Delivery', icon: 'clock', color: 'text-blue-600' },
  { title: '100%', text: 'Reliable', icon: 'badge', color: 'text-orange-500' }
];

const featureRail = [
  { title: 'Upload & Customize', text: 'Upload files and choose print options easily.', icon: 'upload', color: 'from-blue-500 to-indigo-500' },
  { title: 'Real-time Tracking', text: 'Track your order in real time at every step.', icon: 'route', color: 'from-emerald-500 to-teal-500' },
  { title: 'Multiple Options', text: 'Print, bind, deliver or pick up - your choice.', icon: 'sliders', color: 'from-violet-500 to-indigo-500' },
  { title: 'Secure Payments', text: 'Safe, fast and hassle-free payments.', icon: 'shield', color: 'from-emerald-500 to-green-500' },
  { title: 'Reliable Delivery', text: 'Fast pickup & delivery you can count on.', icon: 'scooter', color: 'from-blue-500 to-violet-500' }
];

const steps = [
  { number: '01', title: 'Upload', text: 'Upload your document in PDF, DOC or DOCX.', icon: 'upload', color: 'from-blue-500 to-violet-500' },
  { number: '02', title: 'Customize', text: 'Choose print settings, copies, pages and more.', icon: 'sliders', color: 'from-emerald-500 to-teal-500' },
  { number: '03', title: 'Pay & Confirm', text: 'Review price and make secure payment.', icon: 'card', color: 'from-orange-400 to-amber-500' },
  { number: '04', title: 'We Print', text: 'Shop receives your order and starts printing.', icon: 'printer', color: 'from-blue-400 to-sky-500' },
  { number: '05', title: 'Pick up or Deliver', text: 'Pick up from shop or get it delivered to you.', icon: 'scooter', color: 'from-violet-500 to-indigo-500' }
];

const stats = [
  { value: '0', label: 'Print Shops', icon: 'people', color: 'text-blue-600' },
  { value: '0', label: 'Users', icon: 'user', color: 'text-violet-600' },
  { value: '0', label: 'Orders', icon: 'bell', color: 'text-indigo-600' },
  { value: '0', label: 'Rating', icon: 'star', color: 'text-orange-500' }
];

const mapCenter = {
  lat: 20.2961,
  lon: 85.8245
};

const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lon - 0.01}%2C${mapCenter.lat - 0.008}%2C${mapCenter.lon + 0.01}%2C${mapCenter.lat + 0.008}&layer=mapnik&marker=${mapCenter.lat}%2C${mapCenter.lon}`;
const osmDirectionsUrl = `https://www.openstreetmap.org/directions?from=&to=${mapCenter.lat}%2C${mapCenter.lon}`;

function LogoMark() {
  return (
    <span className="relative block h-14 w-14 shrink-0">
      <span className="absolute left-1 top-0 h-4 w-10 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 shadow-[0_12px_24px_rgba(82,72,255,0.25)]" />
      <span className="absolute left-1 top-0 h-12 w-4 rounded-full bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-500" />
      <span className="absolute left-4 top-3 h-5 w-8 rounded-r-full bg-gradient-to-r from-indigo-400 to-violet-500" />
      <span className="absolute left-1 bottom-0 h-5 w-4 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
    </span>
  );
}

function Icon({ name, className = '' }: { name: string; className?: string }) {
  const base = `relative inline-grid place-items-center ${className}`;

  if (name === 'shield') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 19 6v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      </span>
    );
  }

  if (name === 'doc') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3h7l4 4v14H7V3Z" />
          <path d="M14 3v5h4M9 12h6M9 16h6" />
        </svg>
      </span>
    );
  }

  if (name === 'clock') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </svg>
      </span>
    );
  }

  if (name === 'badge') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5" />
          <path d="m8 13-1 8 5-3 5 3-1-8" />
        </svg>
      </span>
    );
  }

  if (name === 'upload') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V5" />
          <path d="m7 10 5-5 5 5" />
          <path d="M5 16v3h14v-3" />
        </svg>
      </span>
    );
  }

  if (name === 'route') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="6" r="2" />
          <path d="M8 18h3a3 3 0 0 0 0-6h2a3 3 0 0 0 3-3V8" />
        </svg>
      </span>
    );
  }

  if (name === 'sliders') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h8M16 7h4M4 17h4M12 17h8M10 5v4M14 15v4" />
        </svg>
      </span>
    );
  }

  if (name === 'scooter') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 17h8l3-5h-5l-2-4" />
          <path d="M17 7h3M19 7v7" />
          <circle cx="6" cy="17" r="2" />
          <circle cx="18" cy="17" r="2" />
        </svg>
      </span>
    );
  }

  if (name === 'card') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M4 10h16M8 15h2" />
        </svg>
      </span>
    );
  }

  if (name === 'printer') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 8V4h10v4M7 18H5a2 2 0 0 1-2-2v-5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5a2 2 0 0 1-2 2h-2" />
          <path d="M7 14h10v6H7z" />
        </svg>
      </span>
    );
  }

  if (name === 'people' || name === 'user') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0H5Z" />
          {name === 'people' && <path d="M3 19a5 5 0 0 1 5-5M21 19a5 5 0 0 0-5-5" opacity=".45" />}
        </svg>
      </span>
    );
  }

  if (name === 'bell') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
          <path d="M6 10a6 6 0 0 1 12 0v4l2 3H4l2-3v-4Z" />
          <path d="M10 19h4a2 2 0 0 1-4 0Z" />
        </svg>
      </span>
    );
  }

  if (name === 'star') {
    return (
      <span className={base}>
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
          <path d="m12 2 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9L12 2Z" />
        </svg>
      </span>
    );
  }

  return <span className={base} />;
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto h-[430px] max-w-[590px] lg:h-[500px] xl:h-[540px]">
      <div className="absolute left-1/2 top-3 h-[390px] w-[390px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-100 via-violet-100 to-white shadow-[inset_0_30px_80px_rgba(99,102,241,0.16)] lg:h-[455px] lg:w-[455px]" />
      <div className="absolute left-[9%] top-[52%] h-28 w-9 rounded-b-full rounded-t-[22px] bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_18px_28px_rgba(16,185,129,0.18)] before:absolute before:-left-7 before:top-3 before:h-12 before:w-8 before:-rotate-[35deg] before:rounded-full before:bg-emerald-500 after:absolute after:left-7 after:top-1 after:h-14 after:w-9 after:rotate-[35deg] after:rounded-full after:bg-emerald-400" />
      <div className="absolute left-[5%] top-[70%] h-20 w-16 rounded-b-3xl rounded-t-md bg-gradient-to-b from-indigo-200 to-indigo-500 shadow-[0_18px_28px_rgba(79,70,229,0.25)]" />

      <div className="absolute left-[25%] top-[28%] h-56 w-56 -rotate-8 rounded-[28px] bg-gradient-to-br from-indigo-500 to-violet-700 shadow-[0_26px_60px_rgba(79,70,229,0.35)]">
        <div className="absolute -left-6 -top-7 h-28 w-56 -rotate-6 rounded-xl bg-white shadow-[0_16px_40px_rgba(79,70,229,0.18)]" />
        <div className="absolute -left-1 -top-12 h-28 w-56 -rotate-3 rounded-xl bg-white shadow-[0_16px_40px_rgba(79,70,229,0.18)]" />
        <div className="absolute left-4 -top-16 h-28 w-56 rounded-xl bg-gradient-to-br from-white to-indigo-50 shadow-[0_16px_44px_rgba(79,70,229,0.22)]">
          <div className="absolute left-20 top-9 h-8 w-9 rounded-md bg-gradient-to-br from-indigo-300 to-violet-500" />
          <div className="absolute bottom-7 left-16 h-2 w-24 rounded-full bg-indigo-200" />
          <div className="absolute bottom-4 left-24 h-2 w-14 rounded-full bg-indigo-100" />
        </div>
      </div>

      <div className="absolute bottom-5 right-[8%] h-40 w-72 rounded-[26px] bg-gradient-to-b from-white to-slate-200 shadow-[0_30px_70px_rgba(31,41,90,0.22)]">
        <div className="absolute left-10 top-4 h-14 w-56 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-500" />
        <div className="absolute left-36 -top-16 h-24 w-32 -rotate-8 rounded-xl bg-gradient-to-b from-white to-indigo-50 shadow-[0_18px_36px_rgba(79,70,229,0.18)]" />
        <div className="absolute bottom-6 left-11 h-20 w-44 rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 shadow-[0_14px_26px_rgba(15,23,42,0.28)]" />
        <div className="absolute -bottom-10 left-20 h-24 w-40 rotate-6 rounded-md bg-gradient-to-b from-white to-indigo-100 shadow-[0_16px_36px_rgba(79,70,229,0.18)]">
          <div className="mx-auto mt-5 h-3 w-16 rounded-full bg-indigo-200" />
          <div className="mx-auto mt-3 h-3 w-24 rounded-full bg-indigo-100" />
        </div>
        <div className="absolute bottom-12 left-16 h-3 w-24 rounded-full bg-blue-600" />
        <div className="absolute right-6 bottom-14 h-9 w-3 rounded-full bg-slate-700" />
      </div>

      <div className="absolute left-[18%] top-[18%] grid h-20 w-16 place-items-center rounded-[22px] bg-gradient-to-br from-red-100 to-rose-200 shadow-[0_20px_40px_rgba(244,63,94,0.18)]">
        <span className="grid h-12 w-10 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-xs font-black text-white shadow-lg">PDF</span>
      </div>
      <div className="absolute right-[20%] top-[18%] grid h-20 w-16 place-items-center rounded-[20px] bg-gradient-to-br from-white to-blue-100 shadow-[0_20px_40px_rgba(59,130,246,0.16)]">
        <span className="space-y-1">
          <span className="block h-2 w-8 rounded-full bg-blue-300" />
          <span className="block h-2 w-8 rounded-full bg-blue-300" />
          <span className="block h-2 w-8 rounded-full bg-blue-300" />
        </span>
      </div>
      <div className="absolute right-[7%] top-[39%] grid h-20 w-16 place-items-center rounded-[22px] bg-gradient-to-br from-white to-violet-100 shadow-[0_20px_40px_rgba(124,58,237,0.14)]">
        <span className="h-10 w-10 rounded-full bg-[conic-gradient(from_25deg,#ef4444,#f59e0b,#22c55e,#3b82f6,#8b5cf6,#ef4444)]" />
      </div>
      <div className="absolute right-[3%] top-[6%] h-1 w-24 rotate-[-18deg] rounded-full bg-indigo-400 after:absolute after:right-0 after:top-[-10px] after:h-0 after:w-0 after:border-b-[12px] after:border-l-[24px] after:border-t-[12px] after:border-b-transparent after:border-l-indigo-500 after:border-t-transparent" />
      <div className="absolute right-[2%] top-[15%] h-20 w-32 rounded-full border-2 border-dashed border-indigo-400 border-l-transparent border-b-transparent" />
    </div>
  );
}

function OpenStreetMapEmbed({ className = '' }: { className?: string }) {
  return (
    <iframe
      title="PAPrez Print Hub location on OpenStreetMap"
      src={osmEmbedUrl}
      className={`h-full w-full border-0 ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

function MapCard() {
  return (
    <aside className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(49,65,130,0.12)]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-lg font-extrabold text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-600">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
            </svg>
          </span>
          Nearest Print Hub
        </h2>
        <span className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">1.5 km</span>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-600 text-white">
          <Icon name="printer" className="h-5 w-5" />
        </span>
        <div>
          <p className="font-extrabold text-slate-950">PAPrez Print Hub</p>
          <p className="text-xs font-medium text-slate-500">124 Main Street, Downtown</p>
        </div>
      </div>
      <div className="relative mt-5 h-32 overflow-hidden rounded-2xl bg-slate-100">
        <OpenStreetMapEmbed />
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-700">
        <Icon name="clock" className="h-4 w-4 text-blue-600" />
        Open · Closes 10:00 PM
      </div>
      <a href={osmDirectionsUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-sm font-extrabold text-white shadow-[0_16px_32px_rgba(37,99,235,0.22)]">
        Get Direction
        <span className="text-xl leading-none">→</span>
      </a>
    </aside>
  );
}

function MobileAppPreview({
  currentUser,
  onLogout
}: {
  currentUser: SessionUser | null;
  onLogout: () => void;
}) {
  const dashboardHref =
    currentUser?.role === 'SHOP_OWNER'
      ? '/dashboard/print-shop'
      : currentUser?.role === 'ADMIN'
      ? '/dashboard/admin'
      : currentUser?.role === 'DELIVERY_AGENT'
      ? '/dashboard/delivery'
      : '/dashboard/customer';

  const quickActions = [
    { title: 'New Print Order', text: 'Upload & customize', icon: 'route', href: '/dashboard/customer', color: 'from-blue-500 to-violet-600' },
    { title: 'Shop Terminal', text: 'Live counter queue', icon: 'printer', href: '/dashboard/print-shop', color: 'from-indigo-500 to-blue-600' },
    { title: 'Nearby Shops', text: 'Explore local hubs', icon: 'star', href: '/dashboard/customer', color: 'from-emerald-500 to-teal-500' },
    { title: 'Direct Counter', text: 'Order at ABC Xerox', icon: 'badge', href: '/shop/abc-xerox', color: 'from-orange-400 to-amber-600' }
  ];

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#fbfcff] text-[#080f3f] pb-24 lg:hidden">
      <div className="mx-auto w-full max-w-lg px-4 pt-5 pb-8 sm:max-w-2xl sm:px-6">
        {/* Top Header */}
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <span className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
              P
            </span>
            <div className="min-w-0">
              <span className="block text-2xl font-black leading-none tracking-tight text-slate-900">PAPrez</span>
              <span className="block text-[11px] font-semibold text-slate-500 truncate mt-0.5">Smart Printing Simplified</span>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={dashboardHref}
                  className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-blue-700 transition"
                >
                  Dashboard →
                </Link>
                <button
                  onClick={onLogout}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition"
                  title="Sign Out"
                >
                  🚪
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-800 shadow-sm">
                  Login
                </Link>
                <Link href="/auth/signup" className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-black text-white shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* User Greeting & Cross-Portal Switch Bar */}
        <section className="mt-6 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">
                Good Day{currentUser ? `, ${currentUser.name}` : ''}! 👋
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {currentUser ? `Account: ${currentUser.role}` : 'Instant document printing & pickup'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold shrink-0">
              {currentUser ? currentUser.role : 'Guest'}
            </span>
          </div>

          {/* Quick Dual-Portal Access Buttons */}
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
            <Link
              href="/dashboard/customer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition text-center"
            >
              <span>🧑</span>
              <span>Customer Hub</span>
            </Link>
            <Link
              href="/dashboard/print-shop"
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition text-center"
            >
              <span>⚡</span>
              <span>Shop Terminal</span>
            </Link>
          </div>
        </section>

        {/* Document Upload Hero Card */}
        <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 leading-tight">Upload Your Document</h2>
          <p className="mt-1 text-xs font-medium text-slate-500">PDF, DOC, DOCX up to 50MB with instant preview</p>
          <Link
            href="/dashboard/customer"
            className="mt-3.5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 p-5 text-center text-blue-600 hover:bg-indigo-50 transition"
          >
            <Icon name="upload" className="h-10 w-10 text-blue-600" />
            <span className="mt-2 block text-base font-black text-slate-900">
              Tap to Select & Print
            </span>
            <span className="text-xs text-slate-500 mt-0.5">Choose page range, color, binding & shop</span>
          </Link>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-100 text-blue-600 font-black text-[10px]">
              PDF
            </span>
            <span className="min-w-0 flex-1 truncate font-semibold text-slate-800">Sample_Notes.pdf</span>
            <span className="text-slate-400 font-medium">1.8 MB</span>
            <span className="h-5 w-5 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">✓</span>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="mt-4">
          <h2 className="text-base font-black text-slate-900 px-1 mb-2.5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-white p-3 shadow-xs hover:border-blue-200 transition"
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-xs`}>
                  <Icon name={action.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-black leading-tight text-slate-900 truncate">{action.title}</span>
                  <span className="block text-[10px] font-medium text-slate-500 truncate mt-0.5">{action.text}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Nearest Print Hub & Map */}
        <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-blue-600">
                <Icon name="route" className="h-5 w-5" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">Nearest Print Hub</span>
              </div>
              <p className="mt-1 text-base font-black text-slate-900">ABC Xerox & Digital Printing</p>
              <p className="text-xs text-slate-500 mt-0.5">Shop 4, University Gate Road, Bhubaneswar</p>
            </div>
            <span className="self-start sm:self-auto rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 border border-emerald-200 shrink-0">
              0.8 km away
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="flex items-center gap-1.5 font-semibold">
              <Icon name="clock" className="h-4 w-4 text-blue-600" />
              Open · 8:00 AM - 10:00 PM
            </span>
            <span className="text-emerald-600 font-bold">⚡ Fast Queue</span>
          </div>

          {/* Responsive Map Embed */}
          <div className="relative mt-3 h-36 w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 shadow-inner">
            <OpenStreetMapEmbed />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={osmDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
            >
              <span>🧭</span>
              <span>Directions</span>
            </a>
            <Link
              href="/shop/abc-xerox"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
            >
              <span>🖨️</span>
              <span>Order Here</span>
            </Link>
          </div>
        </section>

        {/* Feature Rail Carousel */}
        <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">PAPrez Features</p>
          <div className="overflow-x-auto no-scrollbar flex gap-2.5 pb-1">
            {featureRail.map((feature) => (
              <div
                key={feature.title}
                className="shrink-0 w-32 rounded-xl bg-slate-50 border border-slate-100 p-3 text-center flex flex-col items-center justify-between"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-xs`}>
                  <Icon name={feature.icon} className="h-5 w-5" />
                </span>
                <span className="mt-2 text-xs font-bold leading-tight text-slate-800 line-clamp-1">{feature.title}</span>
                <span className="mt-0.5 text-[10px] text-slate-400 leading-tight line-clamp-1">{feature.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Responsive Grid */}
        <section className="mt-4 mb-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-base font-black text-slate-900">How It Works</h2>
            <Link href="/how-it-works" className="text-xs font-bold text-blue-600 hover:underline">
              Learn more →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs"
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${step.color} text-xs font-black text-white`}>
                  {step.number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 leading-tight">{step.title}</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Persistent Mobile Bottom Navigation Bar on Homepage */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
        <Link href="/" className="flex flex-col items-center justify-center p-1 rounded-xl text-[10px] font-extrabold text-blue-600">
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </Link>
        <Link href="/dashboard/customer" className="flex flex-col items-center justify-center p-1 rounded-xl text-[10px] font-bold text-slate-600 hover:text-blue-600">
          <span className="text-lg">🧑</span>
          <span>Customer</span>
        </Link>
        <Link href="/dashboard/print-shop" className="flex flex-col items-center justify-center p-1 rounded-xl text-[10px] font-bold text-slate-600 hover:text-blue-600">
          <span className="text-lg">⚡</span>
          <span>Shop</span>
        </Link>
        <Link href="/shop/abc-xerox" className="flex flex-col items-center justify-center p-1 rounded-xl text-[10px] font-bold text-slate-600 hover:text-blue-600">
          <span className="text-lg">👁️</span>
          <span>Counter</span>
        </Link>
        {currentUser ? (
          <button onClick={onLogout} className="flex flex-col items-center justify-center p-1 rounded-xl text-[10px] font-bold text-rose-600">
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        ) : (
          <Link href="/auth/login" className="flex flex-col items-center justify-center p-1 rounded-xl text-[10px] font-bold text-slate-600 hover:text-blue-600">
            <span className="text-lg">🔑</span>
            <span>Login</span>
          </Link>
        )}
      </nav>
    </main>
  );
}

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    // 1. Check persistent localStorage session
    const storedUser = localStorage.getItem('paprez_user');
    const token = localStorage.getItem('paprez_token');

    if (storedUser && token) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    } else if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.user) {
            setCurrentUser(data.user);
            localStorage.setItem('paprez_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {});
    }
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('paprez_token');
    localStorage.removeItem('paprez_user');
    document.cookie = 'paprez_token=; path=/; max-age=0';
    document.cookie = 'paprez_user=; path=/; max-age=0';
    setCurrentUser(null);
    window.location.reload();
  }

  const dashboardHref =
    currentUser?.role === 'SHOP_OWNER'
      ? '/dashboard/print-shop'
      : currentUser?.role === 'ADMIN'
      ? '/dashboard/admin'
      : currentUser?.role === 'DELIVERY_AGENT'
      ? '/dashboard/delivery'
      : '/dashboard/customer';

  const roleBadge =
    currentUser?.role === 'SHOP_OWNER'
      ? 'Shop Owner'
      : currentUser?.role === 'ADMIN'
      ? 'Admin'
      : currentUser?.role === 'DELIVERY_AGENT'
      ? 'Delivery'
      : 'Customer';

  return (
    <>
    <MobileAppPreview currentUser={currentUser} onLogout={handleLogout} />
    <main className="hidden min-h-screen overflow-hidden bg-[#fbfcff] text-slate-950 lg:block">
      <div className="relative mx-auto min-h-screen max-w-[1800px] rounded-none border-slate-200 bg-[radial-gradient(circle_at_23%_8%,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_84%_13%,rgba(147,51,234,0.08),transparent_25%),linear-gradient(180deg,#fff_0%,#fbfcff_55%,#fff_100%)] px-5 py-6 sm:px-8 lg:px-16">
        <div className="pointer-events-none absolute bottom-14 left-0 h-72 w-60 bg-[radial-gradient(circle,rgba(99,102,241,0.24)_1px,transparent_1.5px)] bg-[length:16px_16px] opacity-40" />
        <div className="pointer-events-none absolute bottom-14 right-0 h-72 w-72 bg-[radial-gradient(circle,rgba(99,102,241,0.24)_1px,transparent_1.5px)] bg-[length:16px_16px] opacity-40" />

        <nav className="relative z-20 grid items-center gap-5 lg:grid-cols-[330px_1fr]">
          <Link href="/" className="flex items-center gap-4">
            <LogoMark />
            <span>
              <span className="block text-4xl font-black leading-none tracking-normal text-[#080f3f]">PAPrez</span>
              <span className="text-base font-medium leading-none text-[#111b4d]">Smart Printing Simplified.</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 lg:justify-end">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-800">
                  <span className="h-7 w-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-extrabold uppercase">
                    {roleBadge}
                  </span>
                </div>

                <Link
                  href={dashboardHref}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-md hover:shadow-lg transition hover:-translate-y-0.5 inline-flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <span>→</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="rounded-2xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 px-4 py-3 text-sm font-bold text-slate-600 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="rounded-2xl border border-slate-200 bg-white px-9 py-3.5 text-sm font-bold text-[#080f3f] shadow-sm transition hover:border-blue-300">
                  Login
                </Link>
                <Link href="/auth/signup" className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(79,70,229,0.26)] transition hover:-translate-y-0.5">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        <section className="relative z-10 grid items-center gap-8 pt-10 lg:grid-cols-[0.88fr_1.12fr] lg:pt-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-3 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-[0_12px_30px_rgba(79,70,229,0.08)]">
              <span className="text-lg">✦</span>
              #1 Smart Printing Platform
            </span>
            <h1 className="mt-8 text-5xl font-black leading-[1.06] tracking-normal text-[#080f3f] sm:text-6xl xl:text-[76px]">
              Print. Organize.
              <br />
              Pick up or <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Deliver.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-[#34406d]">
              PAPrez makes printing simple, organized and error-free for students, professionals and print shops. Upload, customize, pay and relax - we handle the rest.
            </p>

            <div className="mt-8 flex flex-col gap-5 sm:flex-row">
              <Link
                href={currentUser ? dashboardHref : "/auth/signup?role=CUSTOMER"}
                className="inline-flex items-center justify-center gap-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 text-base font-bold text-white shadow-[0_18px_36px_rgba(79,70,229,0.24)] transition hover:-translate-y-0.5"
              >
                {currentUser ? 'Go to Your Dashboard' : 'Place an Order'}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-2xl text-blue-600">→</span>
              </Link>
              <Link
                href={currentUser ? dashboardHref : "/dashboard/customer"}
                className="inline-flex items-center justify-center gap-6 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-[#080f3f] shadow-sm transition hover:border-blue-300"
              >
                Find Print Shops
                <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-50 text-blue-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
                  </svg>
                </span>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {trustItems.map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <span className={`grid h-14 w-14 place-items-center rounded-full bg-white shadow-[0_12px_28px_rgba(49,65,130,0.1)] ${item.color}`}>
                    <Icon name={item.icon} className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-bold leading-5 text-[#111b4d]">
                    {item.title}
                    <br />
                    <span className="font-medium">{item.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[740px] lg:min-h-[610px] xl:min-h-[650px]">
            <HeroIllustration />
            <div className="absolute right-0 top-1 max-w-[400px] xl:right-1">
              <MapCard />
            </div>
            <div className="absolute bottom-5 right-0 grid w-full max-w-[520px] grid-cols-2 gap-0 rounded-[22px] border border-slate-200 bg-white/95 p-5 shadow-[0_24px_60px_rgba(49,65,130,0.13)] backdrop-blur sm:grid-cols-4 xl:right-0">
              {stats.map((item, index) => (
                <div key={item.label} className={`px-3 text-center ${index > 0 ? 'sm:border-l sm:border-slate-200' : ''}`}>
                  <span className={`mx-auto grid h-10 w-10 place-items-center rounded-full bg-indigo-50 ${item.color}`}>
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <p className="mt-2 text-2xl font-black leading-none text-[#080f3f]">{item.value}{item.value === '4.8' && <span className="text-base"> ★</span>}</p>
                  <p className="mt-2 text-xs font-medium text-[#34406d]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-4 rounded-[28px] border border-slate-200 bg-white px-7 py-7 shadow-[0_26px_70px_rgba(49,65,130,0.08)]">
          <h2 className="text-center text-xl font-black text-[#080f3f]">
            Everything you need in <span className="text-blue-600">one place</span>
          </h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-5">
            {featureRail.map((feature, index) => (
              <div key={feature.title} className={`flex items-center gap-4 px-4 ${index > 0 ? 'lg:border-l lg:border-slate-200' : ''}`}>
                <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br ${feature.color} text-white shadow-[0_18px_36px_rgba(79,70,229,0.12)]`}>
                  <Icon name={feature.icon} className="h-8 w-8" />
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-[#080f3f]">{feature.title}</span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-[#34406d]">{feature.text}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="relative z-10 pb-9 pt-10">
          <div className="text-center">
            <div className="mx-auto flex max-w-md items-center gap-5">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500" />
              <h2 className="text-3xl font-black text-[#080f3f]">How it works</h2>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500" />
            </div>
            <p className="mt-2 font-medium text-[#34406d]">Simple steps to get your prints done</p>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex items-center gap-4 lg:block">
                {index < steps.length - 1 && <span className="absolute left-[calc(100%-20px)] top-12 hidden w-20 border-t-2 border-dashed border-indigo-200 lg:block" />}
                <div className="relative mx-auto grid h-24 w-24 shrink-0 place-items-center rounded-full bg-white shadow-[0_18px_46px_rgba(49,65,130,0.12)]">
                  <span className="absolute -left-4 top-5 rounded-full border border-indigo-100 bg-white px-3 py-2 text-sm font-black text-indigo-700 shadow-sm">{step.number}</span>
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                    <Icon name={step.icon} className="h-8 w-8" />
                  </span>
                </div>
                <div className="lg:mt-4 lg:text-center">
                  <h3 className="font-extrabold text-[#080f3f]">{step.title}</h3>
                  <p className="mt-1 text-xs font-medium leading-5 text-[#34406d]">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
    </>
  );
}

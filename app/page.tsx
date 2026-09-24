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
    { title: 'New Order', text: 'Upload & print', icon: 'route', href: currentUser ? dashboardHref : '/auth/signup?role=CUSTOMER', color: 'from-blue-500 to-violet-600' },
    { title: 'Order History', text: 'Track orders', icon: 'card', href: dashboardHref, color: 'from-emerald-500 to-green-500' },
    { title: 'Saved Shops', text: 'Your favorites', icon: 'star', href: dashboardHref, color: 'from-pink-500 to-rose-500' },
    { title: 'Offers', text: 'View deals', icon: 'badge', href: dashboardHref, color: 'from-orange-400 to-orange-600' }
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfcff] text-[#080f3f] lg:hidden">
      <div className="mx-auto w-full max-w-md px-5 pb-9 pt-7 sm:max-w-2xl sm:px-8 md:max-w-5xl md:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark />
            <span>
              <span className="block text-4xl font-black leading-none tracking-normal">PAPrez</span>
              <span className="block text-base font-medium leading-tight text-[#555985]">Smart Printing Simplified.</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            {currentUser ? (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-2xl bg-blue-600 px-3.5 py-2.5 text-xs font-black text-white shadow-sm"
                >
                  Dashboard →
                </Link>
                <button
                  onClick={onLogout}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[#080f3f] shadow-sm">
                  Login
                </Link>
                <Link href="/auth/signup" className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)]">
                  Register
                </Link>
              </>
            )}
          </div>
        </header>

        <section className="mt-12">
          <h1 className="text-[34px] font-black leading-tight tracking-normal">
            Good Morning{currentUser ? `, ${currentUser.name}` : ''} <span className="inline-block rotate-12">👋</span>
          </h1>
          <p className="mt-1 text-[28px] font-semibold leading-tight text-[#555985]">
            {currentUser ? 'Welcome back to PAPrez!' : 'Welcome back!'}
          </p>
        </section>

        <section className="mt-7 rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(49,65,130,0.08)]">
          <h2 className="text-[28px] font-black leading-tight">Upload your document</h2>
          <p className="mt-2 text-lg font-semibold leading-tight text-[#555985]">PDF, DOC, DOCX up to 50MB</p>
          <Link
            href={currentUser ? dashboardHref : '/auth/signup?role=CUSTOMER'}
            className="mt-5 grid min-h-[132px] place-items-center rounded-2xl border-2 border-dashed border-indigo-400 bg-white px-4 py-5 text-center text-blue-600"
          >
            <span>
              <Icon name="upload" className="mx-auto h-16 w-16" />
              <span className="mt-2 block text-xl font-black">
                {currentUser ? 'Open Counter to Upload' : 'Tap to upload'}
              </span>
            </span>
          </Link>
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-100 text-blue-600">
              <span className="text-[10px] font-black">PDF</span>
            </span>
            <span className="min-w-0 flex-1 truncate text-lg font-semibold">Project_Report.pdf</span>
            <span className="text-lg font-medium text-[#555985]">2.4 MB</span>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-600 text-2xl font-black text-white">✓</span>
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-[26px] font-black leading-tight">Quick Actions</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href} className="flex min-h-[112px] items-center gap-4 rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_14px_38px_rgba(49,65,130,0.08)] md:min-h-[150px] md:flex-col md:items-start md:justify-between">
                <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-[0_14px_26px_rgba(79,70,229,0.17)] md:h-14 md:w-14`}>
                  <Icon name={action.icon} className="h-8 w-8" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-black leading-tight">{action.title}</span>
                  <span className="mt-1 block text-base font-medium leading-tight text-[#555985]">{action.text}</span>
                </span>
                <span className="text-3xl font-light text-[#555985] md:hidden">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(49,65,130,0.08)] md:grid md:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] md:gap-6">
          <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="grid gap-3 pt-1 text-blue-600">
                <Icon name="upload" className="h-7 w-7" />
                <Icon name="route" className="h-9 w-9 rounded-full bg-indigo-50 p-1.5" />
              </div>
              <div>
                <h2 className="text-xl font-black">Nearest Print Hub</h2>
                <p className="mt-3 text-lg font-black">PAPrez Print Hub</p>
                <p className="text-base font-medium text-[#555985]">124 Main Street, Downtown</p>
              </div>
            </div>
            <span className="shrink-0 rounded-xl bg-emerald-50 px-4 py-3 text-base font-black text-emerald-700">1.5 km away</span>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-4 text-lg font-medium text-[#555985]">
            <Icon name="clock" className="h-6 w-6" />
            Open · Closes 10:00 PM
          </div>
          <a href={osmDirectionsUrl} target="_blank" rel="noreferrer" className="mt-4 flex min-h-14 items-center justify-center gap-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-xl font-black text-white shadow-[0_14px_30px_rgba(79,70,229,0.2)]">
            Get Direction
            <span className="text-3xl leading-none">→</span>
          </a>
          </div>
          <div className="relative mt-5 h-28 overflow-hidden rounded-2xl bg-slate-100 md:mt-0 md:h-full md:min-h-[220px]">
            <OpenStreetMapEmbed />
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_rgba(49,65,130,0.08)]">
          <div className="grid grid-cols-5 gap-1">
            {featureRail.map((feature, index) => (
              <div key={feature.title} className={`grid justify-items-center px-1 text-center ${index > 0 ? 'border-l border-slate-200' : ''}`}>
                <span className={`grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br ${feature.color} text-white`}>
                  <Icon name={feature.icon} className="h-7 w-7" />
                </span>
                <span className="mt-3 text-[13px] font-black leading-tight">{feature.title}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#080f3f]">How it works</h2>
          <Link href="/how-it-works" className="text-sm font-black text-blue-600">View all</Link>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step, index) => (
              <div key={step.number} className="relative grid justify-items-center text-center">
                {index < steps.length - 1 && <span className="absolute left-[68%] top-4 w-9 border-t-2 border-dashed border-indigo-200" />}
                <span className={`z-10 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${step.color} text-sm font-black text-white`}>
                  {index + 1}
                </span>
                <span className="mt-3 grid h-16 w-16 place-items-center rounded-2xl border border-slate-100 bg-white text-blue-600 shadow-[0_12px_26px_rgba(49,65,130,0.1)]">
                  <Icon name={step.icon} className="h-8 w-8" />
                </span>
                <span className="mt-3 text-[13px] font-black leading-tight text-[#080f3f]">{step.title}</span>
                <span className="mt-1 text-xs font-medium leading-tight text-[#555985]">{index === 0 ? 'Your document' : index === 1 ? 'Print settings' : index === 2 ? 'Secure payment' : index === 3 ? 'We print it' : 'Fast delivery'}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
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

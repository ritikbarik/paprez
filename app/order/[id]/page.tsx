'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  title: string;
  pageCount: number;
  estimatedPrice: number;
  pickupPin: string;
  urgency: boolean;
  notes?: string;
  documentUrl: string;
  shop: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
  printSetting?: {
    color: boolean;
    doubleSided: boolean;
    copies: number;
    paperSize: string;
    binding: string;
  };
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [queueInfo, setQueueInfo] = useState<{
    ordersAhead: number;
    queuePosition: number;
    estimatedWaitMins: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function playNotificationChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  function fetchOrder(isInitial = false) {
    return fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => {
        setOrder((prev) => {
          if (prev && prev.status !== data.order.status) {
            playNotificationChime();
            let alertMsg = `Order status updated: ${data.order.status}`;
            if (data.order.status === 'ACCEPTED') {
              alertMsg = `✓ ${data.order.shop.name} accepted your job! Printing shortly.`;
            } else if (data.order.status === 'PRINTING') {
              alertMsg = `🖨️ Printing started at ${data.order.shop.name}!`;
            } else if (data.order.status === 'READY_FOR_PICKUP') {
              alertMsg = `📦 Printout ready! Show PIN: ${data.order.pickupPin} at the counter.`;
            } else if (data.order.status === 'COMPLETED') {
              alertMsg = `🎉 Order completed! File permanently erased for privacy.`;
            }
            setToastMessage(alertMsg);
            setTimeout(() => setToastMessage(null), 8000);
          }
          return data.order;
        });
        setQueueInfo(data.queueInfo);
        return data.order;
      })
      .catch((err) => {
        console.error(err);
        return null;
      })
      .finally(() => {
        if (isInitial) setLoading(false);
      });
  }

  useEffect(() => {
    fetchOrder(true);

    // Request desktop notification permission if supported
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    // Poll every 3 seconds for live counter updates until terminal state
    const interval = setInterval(async () => {
      const ord = await fetchOrder();
      if (ord && (ord.status === 'COMPLETED' || ord.status === 'REJECTED' || ord.status === 'CANCELLED')) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold">Checking order status...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center">
          <h1 className="text-xl font-black text-slate-900 mb-2">Order Not Found</h1>
          <p className="text-sm text-slate-600 mb-6">We could not find the specified print job.</p>
          <Link href="/" className="inline-block w-full py-3 bg-blue-600 text-white font-bold rounded-2xl">
            Return Home
          </Link>
        </div>
      </main>
    );
  }

  const steps = [
    { key: 'QUEUED', label: 'In Queue', icon: '⏳' },
    { key: 'ACCEPTED', label: 'Accepted', icon: '✓' },
    { key: 'PRINTING', label: 'Printing', icon: '🖨️' },
    { key: 'READY_FOR_PICKUP', label: 'Ready', icon: '📦' },
    { key: 'COMPLETED', label: 'Completed', icon: '🎉' }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20 text-slate-900 pb-16">
      {/* Header with Back Navigation & Portal Links */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/customer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              title="Back to Customer Orders"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back to My Orders</span>
              <span className="sm:hidden">Orders</span>
            </Link>

            <Link href="/" className="flex items-center gap-1.5">
              <span className="h-7 w-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
                P
              </span>
              <span className="font-black text-base text-slate-950 hidden md:inline">PAPrez</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/print-shop"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition"
              title="View from Shop Terminal"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Shop View</span>
            </Link>

            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-xs">
              #{order.orderNumber}
            </span>
          </div>
        </div>
      </header>

      {/* Live Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-base leading-none shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-5">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-blue-600 transition flex items-center gap-1">
            <span>🏠</span>
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link href="/dashboard/customer" className="hover:text-blue-600 transition">
            My Orders
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate">#{order.orderNumber}</span>
        </nav>
        {/* Status Hero Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <p className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Live Queue Status</p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-3xl">
              {order.status === 'READY_FOR_PICKUP'
                ? '📦'
                : order.status === 'PRINTING'
                ? '🖨️'
                : order.status === 'COMPLETED'
                ? '🎉'
                : order.status === 'REJECTED'
                ? '❌'
                : '⏳'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
              {order.status === 'READY_FOR_PICKUP'
                ? 'Ready for Counter Pickup!'
                : order.status === 'PRINTING'
                ? 'Printing in Progress...'
                : order.status === 'ACCEPTED'
                ? 'Shop Accepted Your Job'
                : order.status === 'COMPLETED'
                ? 'Printout Collected!'
                : order.status === 'REJECTED'
                ? 'Order Rejected'
                : 'Waiting in Shop Queue'}
            </h1>
          </div>

          {/* Accepted Banner */}
          {order.status === 'ACCEPTED' && (
            <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-center space-y-1.5 shadow-xs">
              <div className="flex items-center justify-center gap-2 text-blue-900 font-extrabold text-sm">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600 animate-ping" />
                Shop Accepted Your Print Order!
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>{order.shop.name}</strong> confirmed your job. It is queued on the shop's printer and printing will begin shortly.
              </p>
            </div>
          )}

          {/* Printing Banner */}
          {order.status === 'PRINTING' && (
            <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 text-center space-y-1.5 shadow-xs animate-pulse">
              <div className="flex items-center justify-center gap-2 text-purple-900 font-extrabold text-sm">
                <span className="text-base">🖨️</span>
                Printing in Progress...
              </div>
              <p className="text-xs text-purple-700 leading-relaxed">
                Your document is actively printing at <strong>{order.shop.name}</strong>. Your pickup PIN will be shown here as soon as it completes.
              </p>
            </div>
          )}

          {/* Pickup PIN Alert Box when Ready */}
          {order.status === 'READY_FOR_PICKUP' && (
            <div className="mt-6 p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-md">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-800">Your 4-Digit Pickup PIN</p>
              <div className="mt-2 inline-block px-8 py-3 rounded-2xl bg-white border border-emerald-300 shadow-inner">
                <span className="text-4xl sm:text-5xl font-black tracking-[0.3em] text-emerald-700">
                  {order.pickupPin}
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-emerald-900 leading-relaxed max-w-sm mx-auto">
                Present this PIN to the shopkeeper at <strong>{order.shop.name}</strong> to collect your printout.
              </p>
            </div>
          )}

          {/* Queue Info banner when waiting */}
          {order.status === 'QUEUED' && queueInfo && (
            <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Queue Position</p>
                <p className="text-2xl font-black text-blue-700">#{queueInfo.queuePosition}</p>
                <p className="text-[11px] text-slate-500">{queueInfo.ordersAhead} orders ahead</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Estimated Wait</p>
                <p className="text-2xl font-black text-indigo-700">~{queueInfo.estimatedWaitMins} mins</p>
                <p className="text-[11px] text-slate-500">Live speed estimate</p>
              </div>
            </div>
          )}

          {/* Completed State Guarantee */}
          {order.status === 'COMPLETED' && (
            <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300 text-center space-y-2 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-emerald-950 font-black text-base">
                <span>🎉</span> Order Completed & Handed Over!
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                Thank you for printing with <strong>{order.shop.name}</strong>. Your physical copies have been collected.
              </p>
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-[11px] text-slate-700 font-semibold flex items-center justify-center gap-1.5">
                <span>🔒</span> Document file was permanently erased from server storage for your total privacy.
              </div>
            </div>
          )}

          {/* Stepper Progress Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0" />
              {steps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-bold mt-2 ${
                        isCurrent ? 'text-blue-600' : isPassed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shop Location & Contact Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <p className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Pickup Counter Location</p>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-black text-slate-950 text-lg">{order.shop.name}</h3>
              <p className="text-xs text-slate-600 mt-0.5">📍 {order.shop.address}, {order.shop.city}</p>
            </div>
            <a
              href={`tel:${order.shop.phone}`}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shrink-0"
            >
              📞 Call Shop
            </a>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Order Specifications</h3>

          <div className="space-y-2.5 text-xs text-slate-700 divide-y divide-slate-100">
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500">Document</span>
              <div className="flex items-center gap-2 max-w-[240px]">
                <span className="font-bold text-slate-900 truncate">{order.title}</span>
                {order.documentUrl && !order.documentUrl.startsWith('[DELETED') && !order.documentUrl.startsWith('[PURGED') ? (
                  <a
                    href={`/api/orders/${order.id}/document`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-blue-600 hover:text-blue-800 font-bold underline text-[11px]"
                  >
                    View Doc ↗
                  </a>
                ) : (
                  <span className="shrink-0 text-[10px] bg-slate-100 text-slate-400 font-medium px-1.5 py-0.5 rounded">
                    🔒 Purged
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-2.5">
              <span className="text-slate-500">Print Configuration</span>
              <span className="font-bold text-slate-900">
                {order.printSetting?.color ? 'Color' : 'B&W'} •{' '}
                {order.printSetting?.doubleSided ? 'Double-sided' : 'Single-sided'} •{' '}
                {order.printSetting?.copies || 1} {order.printSetting?.copies === 1 ? 'copy' : 'copies'}
              </span>
            </div>

            <div className="flex justify-between pt-2.5">
              <span className="text-slate-500">Paper & Binding</span>
              <span className="font-bold text-slate-900">
                {order.printSetting?.paperSize || 'A4'} • Binding: {order.printSetting?.binding || 'None'}
              </span>
            </div>

            {order.urgency && (
              <div className="flex justify-between pt-2.5 text-amber-700 font-bold">
                <span>Priority</span>
                <span>🔥 Rush Order</span>
              </div>
            )}

            <div className="flex justify-between pt-2.5 text-sm font-black text-slate-950">
              <span>Paid Amount</span>
              <span className="text-blue-600">₹{order.estimatedPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

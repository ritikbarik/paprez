'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber?: string;
  title: string;
  status: string;
  shop: { name: string; slug?: string };
  estimatedPrice: number;
  urgency: boolean;
  pickupMethod: string;
  pickupPin?: string;
  createdAt: string;
  delivery?: { status: string } | null;
}

interface NearbyShop {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  verified: boolean;
  active: boolean;
  pricingRules: string;
  services: string;
  printers?: Array<{ name: string; capabilities: any }>;
  distanceKm?: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shops, setShops] = useState<NearbyShop[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; category: string; read: boolean; createdAt: string }>>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingShops, setLoadingShops] = useState(true);
  const [userRole, setUserRole] = useState('CUSTOMER');
  const [mounted, setMounted] = useState(false);

  // Geolocation & Scan QR modal
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrInputCode, setQrInputCode] = useState('');

  // AI Editor state
  const [documentText, setDocumentText] = useState('');
  const [editInstruction, setEditInstruction] = useState('Fix grammar and make it print-ready.');
  const [pageRange, setPageRange] = useState('1-5');
  const [aiResult, setAiResult] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  function loadCustomerData() {
    const token = localStorage.getItem('paprez_token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    setLoadingOrders(true);
    fetch('/api/orders', { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orders) setOrders(data.orders);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingOrders(false));

    fetch('/api/shops')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.shops) setShops(data.shops);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingShops(false));

    fetch('/api/notifications', { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  }

  async function handleMarkNotificationRead(id: string) {
    try {
      const token = localStorage.getItem('paprez_token');
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {}
  }

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem('paprez_user');
    if (user) {
      try {
        setUserRole(JSON.parse(user).role);
      } catch (e) {}
    }
    loadCustomerData();

    // Auto-refresh orders and notifications every 5 seconds for live sync
    const interval = setInterval(loadCustomerData, 5000);

    // Auto-detect location on initial load if supported
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setUserCoords({ lat, lon });
        },
        () => {}
      );
    }

    return () => clearInterval(interval);
  }, []);

  function handleDetectLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        setUserCoords({ lat: userLat, lon: userLon });

        const withDist = shops.map((s) => ({
          ...s,
          distanceKm: calculateDistance(userLat, userLon, s.latitude ?? 20.2961, s.longitude ?? 85.8245)
        }));
        withDist.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
        setShops(withDist);
        setDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setDetectingLocation(false);
      }
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUEUED':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'ACCEPTED':
      case 'PRINTING':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'READY_FOR_PICKUP':
        return 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse';
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  async function handleDocumentUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('Reading document...');
    const text = await file.text().catch(() => '');
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name, contentBase64: base64 })
    });

    const data = await res.json();
    if (!res.ok) {
      setUploadStatus(data.error || 'Upload failed.');
      return;
    }

    setDocumentText(text || `${file.name} uploaded. Paste extracted document text here for AI edits.`);
    setUploadStatus(`Uploaded ${file.name}. ${Math.ceil((data.bytes || file.size) / 1024)}KB saved.`);
  }

  async function handleAiEdit() {
    setAiLoading(true);
    setAiResult('');

    const res = await fetch('/api/ai/documents/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('paprez_token')}`
      },
      body: JSON.stringify({ documentText, instruction: editInstruction, pageRange })
    });

    const data = await res.json();
    setAiLoading(false);

    if (!res.ok) {
      setAiResult(data.error || 'AI edit failed.');
      return;
    }

    setAiResult(data.editedText);
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-24 xl:pb-12">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="flex gap-6 xl:gap-8 flex-col xl:flex-row">
          <Sidebar role={userRole} />

          <div className="flex-1 space-y-6 sm:space-y-8 min-w-0">
            {/* Top Navigation Breadcrumbs & Portal Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm">
              <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap pb-0.5">
                <Link href="/" className="hover:text-blue-600 transition flex items-center gap-1">
                  <span>🏠</span>
                  <span>Home</span>
                </Link>
                <span>/</span>
                <span className="text-slate-900 font-bold">Customer Hub & Orders</span>
              </nav>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/print-shop"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition shadow-xs"
                >
                  <span>⚡</span>
                  <span className="hidden sm:inline">Switch to Shop Terminal</span>
                  <span className="sm:hidden">Shop Terminal</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/shop/abc-xerox"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  <span>👁️</span>
                  <span>Counter</span>
                </Link>
              </div>
            </div>

            {/* Header Banner */}
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 sm:p-9 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-bold uppercase tracking-wider mb-3">
                    🚀 Zero WhatsApp Hassle • Instant Cloud Counter
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black">Choose a Nearby Shop or Scan Counter QR</h1>
                  <p className="mt-2 text-xs sm:text-sm text-blue-100 max-w-xl">
                    Walk up to any counter, upload your document, pay seamlessly, and collect your printout. Files are automatically deleted from the server once printed.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="px-5 py-3 rounded-2xl bg-white text-blue-700 font-black text-sm shadow-md hover:bg-blue-50 transition flex items-center justify-center gap-2"
                  >
                    <span>📍</span>
                    <span>{detectingLocation ? 'Detecting GPS...' : 'Find Nearest to Me'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-black/30 backdrop-blur border border-white/30 text-white font-black text-sm hover:bg-black/40 transition flex items-center justify-center gap-2"
                  >
                    <span>📷</span>
                    <span>Scan Counter QR</span>
                  </button>
                </div>
              </div>

              {/* Commission & Privacy Badge */}
              <div className="mt-6 pt-5 border-t border-white/20 flex flex-wrap items-center justify-between text-xs text-blue-100 gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-300">✓</span> <strong>Fair Pricing:</strong> Transparent ₹0.20 / page website commission
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-300">🔒</span> <strong>Total Privacy:</strong> Documents permanently erased from Supabase upon printing
                </span>
              </div>
            </div>

            {/* SECTION 1: AVAILABLE NEARBY PRINT SHOPS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-950 flex items-center gap-2.5">
                    <span>🏪</span> Available Print Shops
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a counter to configure paper size, duplex, and upload your files directly
                  </p>
                </div>

                {userCoords && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                    📍 Sorted by nearest distance
                  </span>
                )}
              </div>

              {loadingShops ? (
                <div className="py-12 text-center text-slate-400 font-bold text-sm">
                  Locating available print shops...
                </div>
              ) : shops.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No print shops found in this area yet.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {shops.map((shop) => {
                    let parsedPricing: any = {};
                    try {
                      parsedPricing = typeof shop.pricingRules === 'string' ? JSON.parse(shop.pricingRules) : shop.pricingRules;
                    } catch (e) {}

                    return (
                      <div
                        key={shop.id}
                        className="rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-black text-slate-950">{shop.name}</h3>
                                {shop.verified && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <span>✓</span> Verified Partner
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{shop.address}, {shop.city}</p>
                            </div>

                            {shop.distanceKm !== undefined ? (
                              <span className="shrink-0 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
                                {shop.distanceKm} km away
                              </span>
                            ) : (
                              <span className="shrink-0 text-xs font-bold text-slate-500">
                                🕒 {shop.operatingHours || 'Open'}
                              </span>
                            )}
                          </div>

                          {/* Quick Pricing Tags */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 font-bold text-slate-700">
                              🖤 B&W: ₹{parsedPricing?.bwSingle || 2}/pg
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 font-bold text-slate-700">
                              🌈 Color: ₹{parsedPricing?.colorSingle || 10}/pg
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 font-bold text-purple-700">
                              +₹0.20 platform fee
                            </span>
                          </div>

                          {/* Hardware Fleet Badges */}
                          {shop.printers && shop.printers.length > 0 && (
                            <p className="text-[11px] text-slate-500 font-medium">
                              🖨️ Fleet: <strong>{shop.printers.map((p) => p.name).join(', ')}</strong>
                            </p>
                          )}
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200/60">
                          <span className="text-xs font-semibold text-slate-500">
                            Counter Slug: <code className="text-blue-600 font-bold">/{shop.slug}</code>
                          </span>

                          <Link
                            href={`/shop/${shop.slug}`}
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow-sm inline-flex items-center gap-1.5"
                          >
                            <span>Open Counter & Upload</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Notifications Feed */}
            {notifications.some((n) => !n.read) && (
              <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5 sm:p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-ping" />
                    🔔 Live Order Updates & Notifications
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {notifications.filter((n) => !n.read).length} new
                  </span>
                </div>

                <div className="space-y-2">
                  {notifications
                    .filter((n) => !n.read)
                    .slice(0, 3)
                    .map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-white rounded-2xl p-3.5 border border-indigo-100 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                          {notif.message}
                        </p>
                        <button
                          onClick={() => handleMarkNotificationRead(notif.id)}
                          className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition"
                        >
                          Dismiss
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* SECTION 2: RECENT ORDERS & PICKUP PINS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-950 flex items-center gap-2">
                    <span>📋</span> Your Print Orders
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Track live status and show your 4-digit pickup PIN at the counter
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">{orders.length} orders</span>
              </div>

              {loadingOrders ? (
                <div className="py-8 text-center text-slate-400 font-bold text-xs">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-sm">
                  You have not placed any orders yet. Choose a shop above to print your first document!
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {order.orderNumber || 'PAP-ORDER'}
                          </span>
                          <h4 className="font-bold text-slate-950 text-sm">{order.title}</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status === 'ACCEPTED' ? '✓ ACCEPTED' : order.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500">
                          Shop: <strong>{order.shop?.name}</strong> • Amount: <strong>₹{order.estimatedPrice}</strong> •{' '}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {order.status === 'COMPLETED' ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                            ✓ Handed Over (File Purged)
                          </span>
                        ) : order.pickupPin ? (
                          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold text-center">
                            PIN: <span className="font-mono text-base font-black tracking-widest">{order.pickupPin}</span>
                          </div>
                        ) : null}

                        <Link
                          href={`/order/${order.id}`}
                          className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-700 border border-blue-200 transition"
                        >
                          Track Status →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 3: AI DOCUMENT PREPARATION ASSISTANT */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
                    <span>✨</span> Pre-Print Document Polisher
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Fix grammar, generate cover pages, or extract specific page ranges before sending to print
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
                  Powered by Qwen AI
                </span>
              </div>

              <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] pt-2">
                <div className="space-y-4">
                  <label className="block rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5 text-center cursor-pointer hover:bg-blue-50 transition">
                    <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleDocumentUpload} className="sr-only" />
                    <span className="block text-sm font-black text-blue-700">Select Document to Polish</span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">PDF, DOC, DOCX, TXT (up to 25MB)</span>
                  </label>
                  {uploadStatus && <p className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{uploadStatus}</p>}

                  <div>
                    <label className="text-xs font-bold text-slate-700">Instruction for AI</label>
                    <textarea
                      value={editInstruction}
                      onChange={(e) => setEditInstruction(e.target.value)}
                      rows={3}
                      placeholder="e.g. Format as academic report with bold headings, fix typos..."
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAiEdit}
                    disabled={aiLoading || !documentText.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-md disabled:opacity-50"
                  >
                    {aiLoading ? 'Polishing with Qwen AI...' : 'Polish Document →'}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Source Text</label>
                    <textarea
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Source document text..."
                      className="w-full h-48 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">AI Output</label>
                    <textarea
                      value={aiResult}
                      onChange={(e) => setAiResult(e.target.value)}
                      placeholder="Polished print-ready result..."
                      className="w-full h-48 rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCAN COUNTER QR CODE MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📷</span>
                <h3 className="text-lg font-black text-slate-950">Counter QR Quick Access</h3>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Standing at a print shop counter? Enter the shop code or select one of the registered hubs below to open the counter upload page instantly.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (qrInputCode.trim()) {
                  window.location.href = `/shop/${qrInputCode.trim().toLowerCase()}`;
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Shop Slug or Counter Code:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. abc-xerox or campus-prints"
                    value={qrInputCode}
                    onChange={(e) => setQrInputCode(e.target.value)}
                    className="flex-1 p-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition"
                  >
                    Open →
                  </button>
                </div>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Campus Shortcuts:</p>
              <div className="flex flex-wrap gap-2">
                {shops.slice(0, 4).map((s) => (
                  <Link
                    key={s.id}
                    href={`/shop/${s.slug}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-xs font-bold text-slate-800 transition"
                  >
                    🏪 {s.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

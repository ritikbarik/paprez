'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';

interface OrderItem {
  id: string;
  orderNumber: string;
  title: string;
  status: string;
  pageCount: number;
  estimatedPrice: number;
  urgency: boolean;
  notes?: string;
  documentUrl: string;
  pickupPin: string;
  createdAt: string;
  customer?: { name: string; email: string };
  customerPhone?: string;
  printSetting?: {
    color: boolean;
    doubleSided: boolean;
    copies: number;
    paperSize: string;
    binding: string;
  };
}

interface PrinterItem {
  id: string;
  name: string;
  model?: string;
  status: string;
  capabilities: any;
}

export default function PrintShopDashboard() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [userRole, setUserRole] = useState('SHOP_OWNER');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Main dashboard section tabs
  const [mainTab, setMainTab] = useState<'QUEUE' | 'COUNTER_QR' | 'MAP_LOCATION' | 'PRINTERS_SERVICES'>('QUEUE');
  const [queueTab, setQueueTab] = useState<'ALL' | 'QUEUED' | 'ACCEPTED' | 'PRINTING' | 'READY_FOR_PICKUP' | 'COMPLETED'>('ALL');

  // Shop details & map location
  const [shopId, setShopId] = useState('');
  const [shopName, setShopName] = useState('ABC Xerox & Digital Printing');
  const [shopSlug, setShopSlug] = useState('abc-xerox');
  const [shopAddress, setShopAddress] = useState('Shop 4, University Gate Road');
  const [shopCity, setShopCity] = useState('Bhubaneswar');
  const [shopPhone, setShopPhone] = useState('+91 98765 43210');
  const [latitude, setLatitude] = useState(20.2961);
  const [longitude, setLongitude] = useState(85.8245);
  const [operatingHours, setOperatingHours] = useState('8:00 AM - 10:00 PM');
  const [shopActive, setShopActive] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Hardware & Printers
  const [printers, setPrinters] = useState<PrinterItem[]>([
    {
      id: 'p1',
      name: 'HP LaserJet Enterprise M608dn',
      model: 'Monochrome Laser with Auto-Duplex',
      status: 'ONLINE',
      capabilities: { color: false, duplex: true, sizes: ['A4', 'Legal'] }
    },
    {
      id: 'p2',
      name: 'Canon imageRUNNER ADVANCE C3530i',
      model: 'Color Multi-Function Workstation',
      status: 'ONLINE',
      capabilities: { color: true, duplex: true, sizes: ['A4', 'A3'] }
    }
  ]);
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newPrinterModel, setNewPrinterModel] = useState('');
  const [newPrinterColor, setNewPrinterColor] = useState(false);
  const [newPrinterDuplex, setNewPrinterDuplex] = useState(true);
  const [addingPrinter, setAddingPrinter] = useState(false);

  // Pricing & Services
  const [bwSingle, setBwSingle] = useState(2);
  const [bwDuplex, setBwDuplex] = useState(3);
  const [colorSingle, setColorSingle] = useState(10);
  const [colorDuplex, setColorDuplex] = useState(18);
  const [spiralBinding, setSpiralBinding] = useState(30);
  const [stapleBinding, setStapleBinding] = useState(10);
  const [lamination, setLamination] = useState(20);
  const [rushFee, setRushFee] = useState(20);

  // PIN verification state
  const [pinInputs, setPinInputs] = useState<{ [orderId: string]: string }>({});
  const [pinErrors, setPinErrors] = useState<{ [orderId: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  function loadInitialShopData() {
    const token = localStorage.getItem('paprez_token');
    const headers: HeadersInit = {
      'x-shop-mode': 'true'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/orders', { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
        if (data?.shop || (data?.orders && data.orders[0]?.shop)) {
          const s = data.shop || data.orders[0].shop;
          if (s.id) setShopId(s.id);
          if (s.name) setShopName(s.name);
          if (s.slug) setShopSlug(s.slug);
          if (s.address) setShopAddress(s.address);
          if (s.city) setShopCity(s.city);
          if (s.phone) setShopPhone(s.phone);
          if (s.latitude) setLatitude(s.latitude);
          if (s.longitude) setLongitude(s.longitude);
          if (s.operatingHours) setOperatingHours(s.operatingHours);
          setShopActive(s.active !== false);

          if (s.pricingRules) {
            try {
              const p = typeof s.pricingRules === 'string' ? JSON.parse(s.pricingRules) : s.pricingRules;
              if (p.bwSingle) setBwSingle(p.bwSingle);
              if (p.bwDuplex) setBwDuplex(p.bwDuplex);
              if (p.colorSingle) setColorSingle(p.colorSingle);
              if (p.colorDuplex) setColorDuplex(p.colorDuplex);
              if (p.spiralBinding) setSpiralBinding(p.spiralBinding);
              if (p.stapleBinding) setStapleBinding(p.stapleBinding);
              if (p.lamination) setLamination(p.lamination);
              if (p.rushFee) setRushFee(p.rushFee);
            } catch (e) {}
          }
        }
      })
      .catch((err) => console.error('Failed to load shop data', err))
      .finally(() => setLoading(false));

    fetch('/api/shops/abc-xerox')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.shop?.printers && data.shop.printers.length > 0) {
          setPrinters(data.shop.printers);
        }
      })
      .catch(() => {});
  }

  function refreshOrdersOnly() {
    const token = localStorage.getItem('paprez_token');
    const headers: HeadersInit = {
      'x-shop-mode': 'true'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/orders', { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        // Only update orders if a valid array is returned; never flash empty state
        if (data?.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem('paprez_user');
    if (user) {
      try {
        setUserRole(JSON.parse(user).role);
      } catch (e) {}
    }
    loadInitialShopData();

    // Silently refresh queue orders every 4 seconds without resetting form states or toggling loading
    const interval = setInterval(refreshOrdersOnly, 4000);
    return () => clearInterval(interval);
  }, []);

  async function updateOrderStatus(orderId: string, status: string, additionalPayload: object = {}) {
    setActionLoading(orderId);
    setPinErrors((prev) => ({ ...prev, [orderId]: '' }));

    // Optimistically update order status immediately so UI updates without lag or disappearance
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );

    // If accepted from QUEUED tab, switch to in-progress tab so the job stays in view
    if (status === 'ACCEPTED' && queueTab === 'QUEUED') {
      setQueueTab('PRINTING');
    }

    try {
      const token = localStorage.getItem('paprez_token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-shop-mode': 'true',
          'x-shop-id': shopId || ''
        },
        body: JSON.stringify({ status, ...additionalPayload })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, ...data.order } : ord))
      );
    } catch (err: any) {
      setPinErrors((prev) => ({ ...prev, [orderId]: err.message }));
      refreshOrdersOnly();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleVerifyPickupPin(orderId: string) {
    const enteredPin = pinInputs[orderId];
    if (!enteredPin || enteredPin.trim().length !== 4) {
      setPinErrors((prev) => ({ ...prev, [orderId]: 'Please enter a valid 4-digit PIN' }));
      return;
    }

    await updateOrderStatus(orderId, 'COMPLETED', { pickupPin: enteredPin.trim() });
    setPinInputs((prev) => ({ ...prev, [orderId]: '' }));
  }

  async function toggleShopActiveStatus() {
    const newStatus = !shopActive;
    setShopActive(newStatus);

    try {
      const token = localStorage.getItem('paprez_token');
      await fetch('/api/shops', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ active: newStatus })
      });
    } catch (err) {
      console.warn('Shop status toggle fallback');
    }
  }

  function handleDetectGps() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(Number(position.coords.latitude.toFixed(5)));
        setLongitude(Number(position.coords.longitude.toFixed(5)));
        setDetectingGps(false);
      },
      () => {
        setDetectingGps(false);
        alert('Could not retrieve current GPS coordinates. Please type manually.');
      }
    );
  }

  async function handleSaveShopConfig() {
    setSaveStatus('Saving shop configuration...');
    try {
      const token = localStorage.getItem('paprez_token');
      const res = await fetch('/api/shops', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: shopName,
          address: shopAddress,
          city: shopCity,
          phone: shopPhone,
          latitude,
          longitude,
          operatingHours,
          pricingRules: {
            bwSingle,
            bwDuplex,
            colorSingle,
            colorDuplex,
            spiralBinding,
            stapleBinding,
            lamination,
            rushFee
          },
          services: [
            'B&W Printing',
            'Color Printing',
            'Duplex Printing',
            'Spiral Binding',
            'Staple Binding',
            'Lamination',
            'Rush Priority'
          ]
        })
      });

      if (res.ok) {
        setSaveStatus('✓ Shop location, printers, and services updated successfully!');
        setTimeout(() => setSaveStatus(''), 4000);
      } else {
        setSaveStatus('Error saving profile changes.');
      }
    } catch (err) {
      setSaveStatus('Failed to save profile changes.');
    }
  }

  async function handleAddPrinter(e: React.FormEvent) {
    e.preventDefault();
    if (!newPrinterName) return;

    setAddingPrinter(true);
    try {
      const token = localStorage.getItem('paprez_token');
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newPrinterName,
          model: newPrinterModel || 'Network Laser Spooler',
          capabilities: {
            color: newPrinterColor,
            duplex: newPrinterDuplex,
            sizes: ['A4', 'Legal']
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.printer) {
        setPrinters([...printers, data.printer]);
        setNewPrinterName('');
        setNewPrinterModel('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingPrinter(false);
    }
  }

  // Filter orders by active queue tab
  const filteredOrders = orders.filter((o) => {
    if (queueTab === 'ALL') return true;
    if (queueTab === 'PRINTING') return o.status === 'PRINTING' || o.status === 'ACCEPTED';
    return o.status === queueTab;
  });

  const queuedCount = orders.filter((o) => o.status === 'QUEUED').length;
  const inProgressCount = orders.filter((o) => o.status === 'PRINTING' || o.status === 'ACCEPTED').length;
  const printingCount = inProgressCount;
  const readyCount = orders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED' || o.status === 'READY_FOR_PICKUP' || o.status === 'PRINTING' || o.status === 'ACCEPTED')
    .reduce((sum, o) => sum + (o.estimatedPrice || 0), 0);

  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.008}%2C${latitude - 0.006}%2C${longitude + 0.008}%2C${latitude + 0.006}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 pb-24 xl:pb-12">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="flex gap-6 xl:gap-8 flex-col xl:flex-row">
          <Sidebar role={userRole} />

          <div className="flex-1 space-y-6 min-w-0">
            {/* Top Navigation Breadcrumbs & Cross-Portal Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm">
              <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap pb-0.5">
                <Link href="/" className="hover:text-blue-600 transition flex items-center gap-1">
                  <span>🏠</span>
                  <span>Home</span>
                </Link>
                <span>/</span>
                <span className="text-slate-900 font-bold truncate max-w-[200px]">Shop Terminal ({shopName})</span>
              </nav>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/customer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition shadow-xs"
                >
                  <span>🧑</span>
                  <span className="hidden sm:inline">Switch to Customer View</span>
                  <span className="sm:hidden">Customer View</span>
                  <span>→</span>
                </Link>
                <Link
                  href={`/shop/${shopSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  <span>👁️</span>
                  <span>Counter Page</span>
                </Link>
              </div>
            </div>

            {/* Header with Shop Details & Master Tabs */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-blue-600 font-extrabold">Shop Operating Terminal</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                      slug: /{shopSlug}
                    </span>
                  </div>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-950">{shopName}</h1>
                  <p className="text-xs text-slate-500 mt-1">📍 {shopAddress}, {shopCity} • 🕒 {operatingHours}</p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <a
                    href={`/shop/${shopSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 text-xs font-bold text-slate-700 shadow-sm transition"
                  >
                    View QR Counter ↗
                  </a>

                  <button
                    onClick={toggleShopActiveStatus}
                    className={`px-5 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 shadow-sm ${
                      shopActive
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${shopActive ? 'bg-rose-500' : 'bg-white animate-pulse'}`} />
                    {shopActive ? 'Pause New Orders' : 'Resume Accepting Orders'}
                  </button>
                </div>
              </div>

              {/* Main Section Navigation Tabs */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 whitespace-nowrap">
                <button
                  onClick={() => setMainTab('QUEUE')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
                    mainTab === 'QUEUE'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>⚡ Live Counter Queue</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-md text-[10px]">{queuedCount}</span>
                </button>

                <button
                  onClick={() => setMainTab('COUNTER_QR')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                    mainTab === 'COUNTER_QR'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>📷 Counter QR Standee</span>
                </button>

                <button
                  onClick={() => setMainTab('MAP_LOCATION')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                    mainTab === 'MAP_LOCATION'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>📍 Exact Map Location</span>
                </button>

                <button
                  onClick={() => setMainTab('PRINTERS_SERVICES')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                    mainTab === 'PRINTERS_SERVICES'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>🖨️ Printers & Services</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-md text-[10px]">{printers.length}</span>
                </button>
              </div>

              {/* Status Alert Banner */}
              {!shopActive && (
                <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
                  <span>🔴 Shop is PAUSED. Customers scanning the counter QR will see that new orders are temporarily on hold.</span>
                  <button onClick={toggleShopActiveStatus} className="underline ml-2">Resume Now</button>
                </div>
              )}
            </div>

            {/* SECTION 1: LIVE COUNTER QUEUE */}
            {mainTab === 'QUEUE' && (
              <div className="space-y-6">
                {/* Stats Bar */}
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase">Incoming Queue</p>
                    <p className="mt-2 text-3xl font-black text-amber-600">{queuedCount}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Awaiting shop accept</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase">Printing Active</p>
                    <p className="mt-2 text-3xl font-black text-indigo-600">{printingCount}</p>
                    <p className="mt-1 text-[11px] text-slate-500">In spooler</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase">Ready for Pickup</p>
                    <p className="mt-2 text-3xl font-black text-emerald-600">{readyCount}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Awaiting customer PIN</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase">Processed Volume</p>
                    <p className="mt-2 text-3xl font-black text-blue-600">₹{totalRevenue.toFixed(0)}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Total volume today</p>
                  </div>
                </div>

                {/* Queue Card Table */}
                <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl font-black text-slate-950">Active Counter Orders</h2>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-100 rounded-2xl text-xs font-bold whitespace-nowrap max-w-full">
                      {[
                        { id: 'ALL', label: `All Orders (${orders.length})` },
                        { id: 'QUEUED', label: `Queued (${queuedCount})` },
                        { id: 'PRINTING', label: `In Progress (${inProgressCount})` },
                        { id: 'READY_FOR_PICKUP', label: `Ready for Pickup (${readyCount})` },
                        { id: 'COMPLETED', label: `Completed (${completedCount})` }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setQueueTab(tab.id as any)}
                          className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                            queueTab === tab.id
                              ? 'bg-white text-slate-950 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loading && orders.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-sm font-semibold animate-pulse">
                      Loading queue orders...
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
                      <p className="text-slate-600 font-bold text-sm">No orders in this view</p>
                      <p className="text-xs text-slate-400 mt-1">Incoming counter orders will appear here automatically</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((ord) => {
                        const isQueued = ord.status === 'QUEUED';
                        const isAccepted = ord.status === 'ACCEPTED';
                        const isPrinting = ord.status === 'PRINTING';
                        const isReady = ord.status === 'READY_FOR_PICKUP';
                        const isCompleted = ord.status === 'COMPLETED';

                        return (
                          <div
                            key={ord.id}
                            className={`rounded-2xl border p-5 transition shadow-sm ${
                              ord.urgency
                                ? 'border-amber-300 bg-amber-50/20'
                                : 'border-slate-200 bg-white hover:border-blue-200'
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-sm text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                                    #{ord.orderNumber}
                                  </span>

                                  {ord.urgency && (
                                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-black">
                                      🔥 RUSH ORDER
                                    </span>
                                  )}

                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                      isCompleted
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : isReady
                                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                                        : isPrinting
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        : isQueued
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {ord.status.replace(/_/g, ' ')}
                                  </span>

                                  <span className="text-xs text-slate-400">
                                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                <div>
                                  <h3 className="font-black text-slate-950 text-base truncate">{ord.title}</h3>
                                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                                    📄 <strong>{ord.pageCount} Pages</strong> •{' '}
                                    {ord.printSetting?.color ? '🌈 Full Color' : '🖤 Black & White'} •{' '}
                                    {ord.printSetting?.doubleSided ? 'Double-sided' : 'Single-sided'} •{' '}
                                    {ord.printSetting?.copies} {ord.printSetting?.copies === 1 ? 'copy' : 'copies'} •{' '}
                                    {ord.printSetting?.paperSize || 'A4'}
                                    {ord.printSetting?.binding && ord.printSetting.binding !== 'none' && (
                                      <> • Binding: <strong>{ord.printSetting.binding}</strong></>
                                    )}
                                  </p>
                                </div>

                                {ord.notes && (
                                  <p className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700">
                                    💬 <em>Customer Note:</em> {ord.notes}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                                  <span>Customer: <strong>{ord.customer?.name || 'Walk-in'}</strong></span>
                                  {ord.customerPhone && <span>Phone: <strong>{ord.customerPhone}</strong></span>}
                                  <span>Paid: <strong className="text-slate-900 font-bold">₹{ord.estimatedPrice.toFixed(2)}</strong></span>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                                {ord.documentUrl && !ord.documentUrl.startsWith('[DELETED') && !ord.documentUrl.startsWith('[PURGED') ? (
                                  <a
                                    href={`/api/orders/${ord.id}/document`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 text-center transition shadow-xs"
                                  >
                                    View Doc ↗
                                  </a>
                                ) : (
                                  <span className="px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-semibold border border-slate-200 text-center">
                                    🔒 File Purged
                                  </span>
                                )}

                                {pinErrors[ord.id] && !isReady && (
                                  <span className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                                    ⚠️ {pinErrors[ord.id]}
                                  </span>
                                )}

                                {isQueued && (
                                  <>
                                    <button
                                      onClick={() => updateOrderStatus(ord.id, 'ACCEPTED')}
                                      disabled={actionLoading === ord.id}
                                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow-sm"
                                    >
                                      {actionLoading === ord.id ? 'Accepting...' : 'Accept Job'}
                                    </button>
                                    <button
                                      onClick={() => updateOrderStatus(ord.id, 'REJECTED', { rejectedReason: 'Queue capacity reached' })}
                                      disabled={actionLoading === ord.id}
                                      className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition"
                                    >
                                      Reject & Refund
                                    </button>
                                  </>
                                )}

                                {isAccepted && (
                                  <button
                                    onClick={() => updateOrderStatus(ord.id, 'PRINTING')}
                                    disabled={actionLoading === ord.id}
                                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow-sm"
                                  >
                                    🖨️ Start Print
                                  </button>
                                )}

                                {isPrinting && (
                                  <button
                                    onClick={() => updateOrderStatus(ord.id, 'READY_FOR_PICKUP')}
                                    disabled={actionLoading === ord.id}
                                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs transition shadow-sm"
                                  >
                                    ✓ Mark Ready for Pickup
                                  </button>
                                )}

                                {isReady && (
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="4-digit PIN"
                                        value={pinInputs[ord.id] || ''}
                                        onChange={(e) =>
                                          setPinInputs((prev) => ({ ...prev, [ord.id]: e.target.value }))
                                        }
                                        className="w-24 px-2.5 py-2 rounded-xl border border-slate-300 text-center font-black tracking-widest text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                      />
                                      <button
                                        onClick={() => handleVerifyPickupPin(ord.id)}
                                        disabled={actionLoading === ord.id}
                                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-sm"
                                      >
                                        Verify Pickup
                                      </button>
                                    </div>
                                    {pinErrors[ord.id] && (
                                      <span className="text-[10px] text-rose-600 font-bold">{pinErrors[ord.id]}</span>
                                    )}
                                  </div>
                                )}

                                {isCompleted && (
                                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                                    ✓ Verified Handover (File Purged)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 2: COUNTER QR STANDEE (FOR COUNTER DESK) */}
            {mainTab === 'COUNTER_QR' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-950 flex items-center gap-2">
                        <span>📷</span> Your Unique Counter QR Standee
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Print this standee flyer or display it on your counter desk. Customers scan it with their camera to immediately open your shop counter with zero app installs!
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition"
                      >
                        <span>🖨️</span>
                        <span>Print Standee Flyer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/shop/${shopSlug}`;
                          navigator.clipboard.writeText(url);
                          alert('Counter URL copied to clipboard!');
                        }}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                      >
                        📋 Copy Link
                      </button>

                      <a
                        href={`/shop/${shopSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition"
                      >
                        Open Live Counter ↗
                      </a>
                    </div>
                  </div>

                  {/* Printable Standee Card */}
                  <div className="max-w-md mx-auto rounded-3xl border-2 border-indigo-200 bg-gradient-to-b from-white via-indigo-50/20 to-blue-50/40 p-8 shadow-xl text-center space-y-5 print:border-black print:shadow-none">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest mb-2">
                        PAPrez Smart Counter
                      </span>
                      <h3 className="text-2xl font-black text-slate-950">{shopName}</h3>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">Instant Digital Print Counter</p>
                    </div>

                    {/* QR Code Graphic */}
                    <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm inline-block mx-auto">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                          typeof window !== 'undefined' ? `${window.location.origin}/shop/${shopSlug}` : `https://paprez.vercel.app/shop/${shopSlug}`
                        )}`}
                        alt="Shop Counter QR Code"
                        className="w-56 h-56 mx-auto block"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900">📲 Scan with Phone Camera to Print</p>
                      <p className="text-xs text-slate-500">
                        Counter URL: <strong className="text-blue-600">paprez.com/shop/{shopSlug}</strong>
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-700 pt-3 border-t border-indigo-100">
                      <div className="p-2 rounded-xl bg-white/80 border border-slate-200/60">
                        1. Scan QR
                      </div>
                      <div className="p-2 rounded-xl bg-white/80 border border-slate-200/60">
                        2. Upload File
                      </div>
                      <div className="p-2 rounded-xl bg-white/80 border border-slate-200/60">
                        3. Collect Print
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] font-semibold text-slate-500">
                      🔒 <strong>100% Privacy Guarantee:</strong> Documents are automatically erased from the cloud server immediately after printing. Zero WhatsApp hassle.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: MAP LOCATION & ADDRESS */}
            {mainTab === 'MAP_LOCATION' && (
              <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Shop Map Coordinates & Counter Address</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      This pinpoint appears on the customer counter page and navigation map.
                    </p>
                  </div>

                  <button
                    onClick={handleDetectGps}
                    disabled={detectingGps}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <span>📍</span>
                    {detectingGps ? 'Detecting GPS...' : 'Use My Current GPS'}
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Live Map Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">Live Counter Pin Preview:</span>
                    <a
                      href={`https://www.openstreetmap.org/directions?from=&to=${latitude}%2C${longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-bold"
                    >
                      Open in OpenStreetMap ↗
                    </a>
                  </div>
                  <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                    <iframe
                      title="Shop Counter OpenStreetMap Location"
                      src={mapEmbedUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Address & City Fields */}
                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Physical Address</label>
                    <input
                      type="text"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                    <input
                      type="text"
                      value={shopCity}
                      onChange={(e) => setShopCity(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Counter Phone Number</label>
                    <input
                      type="tel"
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Operating Hours</label>
                    <input
                      type="text"
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleSaveShopConfig}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-md hover:shadow-lg transition"
                  >
                    Save Location & Address Updates
                  </button>
                  {saveStatus && <p className="text-xs font-bold text-blue-600 mt-2">{saveStatus}</p>}
                </div>
              </div>
            )}

            {/* SECTION 3: PRINTERS & SERVICES */}
            {mainTab === 'PRINTERS_SERVICES' && (
              <div className="space-y-6">
                {/* Printers Fleet */}
                <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-950">Connected Hardware & Printers</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Physical printers receiving jobs via the Windows Print Agent</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {printers.map((p) => (
                      <div key={p.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-slate-900 text-sm">{p.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{p.model || 'Network Spooler'}</p>

                        <div className="flex items-center gap-1.5 pt-1">
                          {p.capabilities?.duplex && (
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Auto Duplex</span>
                          )}
                          {p.capabilities?.color ? (
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">Color Laser</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">B&W Laser</span>
                          )}
                          {p.capabilities?.sizes && (
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                              {p.capabilities.sizes.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Printer Form */}
                  <form onSubmit={handleAddPrinter} className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                    <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider">Connect New Printer</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Printer Device Name</label>
                        <input
                          type="text"
                          required
                          value={newPrinterName}
                          onChange={(e) => setNewPrinterName(e.target.value)}
                          placeholder="e.g. Epson EcoTank L3250"
                          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Model / Driver Type</label>
                        <input
                          type="text"
                          value={newPrinterModel}
                          onChange={(e) => setNewPrinterModel(e.target.value)}
                          placeholder="e.g. Continuous Ink Tank Color"
                          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPrinterColor}
                          onChange={(e) => setNewPrinterColor(e.target.checked)}
                          className="h-4 w-4 accent-blue-600 rounded"
                        />
                        <span className="text-xs font-bold text-slate-800">Color Supported</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPrinterDuplex}
                          onChange={(e) => setNewPrinterDuplex(e.target.checked)}
                          className="h-4 w-4 accent-blue-600 rounded"
                        />
                        <span className="text-xs font-bold text-slate-800">Auto Duplex Supported</span>
                      </label>

                      <button
                        type="submit"
                        disabled={addingPrinter}
                        className="ml-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-sm transition"
                      >
                        {addingPrinter ? 'Adding...' : '+ Add Printer to Hub'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Pricing & Services Management */}
                <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Printing Rates & Finishing Services</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Customize per-page print charges, binding rates, and rush queue fees</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">B&W Single (₹)</label>
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={bwSingle}
                        onChange={(e) => setBwSingle(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">B&W Duplex (₹)</label>
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={bwDuplex}
                        onChange={(e) => setBwDuplex(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Color Single (₹)</label>
                      <input
                        type="number"
                        min={1}
                        value={colorSingle}
                        onChange={(e) => setColorSingle(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Color Duplex (₹)</label>
                      <input
                        type="number"
                        min={1}
                        value={colorDuplex}
                        onChange={(e) => setColorDuplex(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-black text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Spiral Binding (₹)</label>
                      <input
                        type="number"
                        value={spiralBinding}
                        onChange={(e) => setSpiralBinding(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Staple Binding (₹)</label>
                      <input
                        type="number"
                        value={stapleBinding}
                        onChange={(e) => setStapleBinding(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Lamination (₹)</label>
                      <input
                        type="number"
                        value={lamination}
                        onChange={(e) => setLamination(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Rush Queue Fee (₹)</label>
                      <input
                        type="number"
                        value={rushFee}
                        onChange={(e) => setRushFee(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-black text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveShopConfig}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-md hover:shadow-lg transition"
                    >
                      Save Pricing & Services
                    </button>
                    {saveStatus && <p className="text-xs font-bold text-blue-600 mt-2">{saveStatus}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

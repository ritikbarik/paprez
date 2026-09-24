'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import Link from 'next/link';

interface OverviewMetrics {
  totalUsers: number;
  totalShops: number;
  verifiedShops: number;
  totalOrders: number;
  totalPages: number;
  totalGMV: number;
  platformRevenue: number;
  commissionPerUnit: number;
  activeQueue: number;
  completedOrders: number;
}

interface ShopItem {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  active: boolean;
  verified: boolean;
  feePercentage: number;
  pricingRules: string;
  services: string;
  earnings: number;
  owner?: { name: string; email: string };
  printers?: Array<{
    id: string;
    name: string;
    model?: string;
    status: string;
    capabilities: any;
  }>;
  _count?: { orders: number };
}

export default function AdminDashboard() {
  const [userRole, setUserRole] = useState('ADMIN');
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingShopId, setUpdatingShopId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  function loadAdminData() {
    const token = localStorage.getItem('paprez_token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('/api/admin/overview', { headers }).then((res) => (res.ok ? res.json() : null)),
      fetch('/api/admin/shops', { headers }).then((res) => (res.ok ? res.json() : null))
    ])
      .then(([overviewData, shopsData]) => {
        if (overviewData?.metrics) setMetrics(overviewData.metrics);
        if (shopsData?.shops) setShops(shopsData.shops);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem('paprez_user');
    if (user) setUserRole(JSON.parse(user).role);
    loadAdminData();
  }, []);

  async function handleToggleVerification(shopId: string, currentVerified: boolean) {
    setUpdatingShopId(shopId);
    try {
      const token = localStorage.getItem('paprez_token');
      const res = await fetch('/api/admin/shops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shopId, verified: !currentVerified })
      });

      if (res.ok) {
        setShops((prev) =>
          prev.map((s) => (s.id === shopId ? { ...s, verified: !currentVerified } : s))
        );
        // Refresh metrics
        const overviewRes = await fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (overviewRes.ok) {
          const oData = await overviewRes.json();
          if (oData.metrics) setMetrics(oData.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to update verification status', err);
    } finally {
      setUpdatingShopId(null);
    }
  }

  async function handleToggleShopActive(shopId: string, currentActive: boolean) {
    setUpdatingShopId(shopId);
    try {
      const token = localStorage.getItem('paprez_token');
      const res = await fetch('/api/admin/shops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shopId, active: !currentActive })
      });

      if (res.ok) {
        setShops((prev) =>
          prev.map((s) => (s.id === shopId ? { ...s, active: !currentActive } : s))
        );
      }
    } catch (err) {
      console.error('Failed to toggle shop active state', err);
    } finally {
      setUpdatingShopId(null);
    }
  }

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shop.owner?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (filterVerified === 'VERIFIED') return matchesSearch && shop.verified;
    if (filterVerified === 'PENDING') return matchesSearch && !shop.verified;
    return matchesSearch;
  });

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          <Sidebar role={userRole} />

          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="rounded-3xl border border-slate-200 bg-white/95 backdrop-blur p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/70 border border-purple-200 text-purple-800 text-xs font-black uppercase tracking-wider mb-2">
                    🛡️ Admin Verification Authority
                  </div>
                  <h1 className="text-3xl font-black text-slate-950">Shop Information & Verification</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Inspect registered print hubs, verify partner credentials, and track website commissions
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-600">Platform Online</span>
                </div>
              </div>

              {/* Commission & Metric Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6 pt-6 border-t border-slate-100">
                <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50/50 p-5">
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                    Website Commission Earned
                  </p>
                  <p className="mt-2 text-3xl font-black text-purple-900">
                    ₹{metrics?.platformRevenue ?? 0}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-purple-600">
                    ₹0.20 per printed page ({metrics?.totalPages ?? 0} pages total)
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Print Shops</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{metrics?.totalShops ?? shops.length}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Registered operating terminals</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Verified Partners</p>
                  <p className="mt-2 text-3xl font-black text-emerald-600">
                    {metrics?.verifiedShops ?? shops.filter((s) => s.verified).length}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Authorized with green verified badge</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Orders Processed</p>
                  <p className="mt-2 text-3xl font-black text-blue-600">{metrics?.totalOrders ?? 0}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Gross volume: ₹{metrics?.totalGMV ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search by shop name, city, owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
                <span className="absolute left-3 top-3 text-slate-400 text-xs">🔍</span>
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setFilterVerified('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    filterVerified === 'ALL'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({shops.length})
                </button>
                <button
                  onClick={() => setFilterVerified('VERIFIED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    filterVerified === 'VERIFIED'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Verified ({shops.filter((s) => s.verified).length})
                </button>
                <button
                  onClick={() => setFilterVerified('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    filterVerified === 'PENDING'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Unverified ({shops.filter((s) => !s.verified).length})
                </button>
              </div>
            </div>

            {/* Print Shops List */}
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                <p className="text-sm font-bold">Loading print shops information...</p>
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                <p className="text-sm font-bold">No print shops match the filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredShops.map((shop) => {
                  let parsedPricing: any = {};
                  let parsedServices: string[] = [];
                  try {
                    parsedPricing = typeof shop.pricingRules === 'string' ? JSON.parse(shop.pricingRules) : shop.pricingRules;
                  } catch (e) {}
                  try {
                    parsedServices = typeof shop.services === 'string' ? JSON.parse(shop.services) : shop.services;
                  } catch (e) {}

                  return (
                    <div
                      key={shop.id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition space-y-5"
                    >
                      {/* Shop Header & Verification Switch */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h2 className="text-xl font-black text-slate-950">{shop.name}</h2>
                            {shop.verified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                                <span>✓</span> Verified Partner
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-300">
                                <span>⚠️</span> Unverified Shop
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                shop.active ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {shop.active ? 'Live Accepting Orders' : 'Paused'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 font-medium">
                            Counter URL:{' '}
                            <Link
                              href={`/shop/${shop.slug}`}
                              target="_blank"
                              className="text-purple-600 font-bold hover:underline"
                            >
                              /shop/{shop.slug} ↗
                            </Link>{' '}
                            • Operating Hours: <strong>{shop.operatingHours || '8:00 AM - 10:00 PM'}</strong>
                          </p>
                        </div>

                        {/* Verification Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={updatingShopId === shop.id}
                            onClick={() => handleToggleVerification(shop.id, shop.verified)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition shadow-sm ${
                              shop.verified
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {updatingShopId === shop.id
                              ? 'Saving...'
                              : shop.verified
                              ? '✓ Verified (Click to Revoke)'
                              : 'Verify Shop Partner Now'}
                          </button>

                          <button
                            type="button"
                            disabled={updatingShopId === shop.id}
                            onClick={() => handleToggleShopActive(shop.id, shop.active)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                              shop.active
                                ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                                : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            {shop.active ? 'Pause' : 'Activate'}
                          </button>
                        </div>
                      </div>

                      {/* Information Columns */}
                      <div className="grid sm:grid-cols-3 gap-5 text-xs">
                        {/* Column 1: Owner & Contact */}
                        <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                          <p className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                            Shop Owner & Contact
                          </p>
                          <p className="font-bold text-slate-900 text-sm">{shop.owner?.name || 'Shopkeeper'}</p>
                          <p className="text-slate-600 font-medium">✉️ {shop.owner?.email || 'No email'}</p>
                          <p className="text-slate-600 font-medium">📞 {shop.phone || 'No phone'}</p>
                          <p className="text-slate-600 font-medium">
                            Orders Completed: <strong>{shop._count?.orders ?? 0}</strong>
                          </p>
                        </div>

                        {/* Column 2: Exact Location & Coordinates */}
                        <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                          <p className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                            Exact Location & Coordinates
                          </p>
                          <p className="font-bold text-slate-900">{shop.address}</p>
                          <p className="text-slate-600 font-medium">{shop.city}</p>
                          <p className="text-slate-600 font-mono text-[11px]">
                            Lat: {shop.latitude ?? 20.2961}, Lon: {shop.longitude ?? 85.8245}
                          </p>
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${shop.latitude}&mlon=${shop.longitude}#map=16/${shop.latitude}/${shop.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-purple-600 font-bold hover:underline text-[11px]"
                          >
                            📍 View on OpenStreetMap ↗
                          </a>
                        </div>

                        {/* Column 3: Rates & Platform Fee */}
                        <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                          <p className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                            Rates & Commission
                          </p>
                          <p className="text-slate-700">
                            B&W Rate: <strong>₹{parsedPricing?.bwSingle || 2}/pg</strong> (Duplex: ₹
                            {parsedPricing?.bwDuplex || 3})
                          </p>
                          <p className="text-slate-700">
                            Color Rate: <strong>₹{parsedPricing?.colorSingle || 10}/pg</strong> (Duplex: ₹
                            {parsedPricing?.colorDuplex || 18})
                          </p>
                          <p className="text-slate-700">
                            Spiral: ₹{parsedPricing?.spiralBinding || 30} • Staple: ₹
                            {parsedPricing?.stapleBinding || 10}
                          </p>
                          <div className="pt-1 mt-1 border-t border-slate-200/60 text-purple-700 font-bold">
                            Website Fee: 0.20 / page
                          </div>
                        </div>
                      </div>

                      {/* Connected Printer Fleet */}
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                          Hardware Fleet & Spoolers ({shop.printers?.length || 0})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {shop.printers && shop.printers.length > 0 ? (
                            shop.printers.map((printer) => {
                              let caps: any = {};
                              try {
                                caps =
                                  typeof printer.capabilities === 'string'
                                    ? JSON.parse(printer.capabilities)
                                    : printer.capabilities;
                              } catch (e) {}

                              return (
                                <div
                                  key={printer.id}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
                                >
                                  <span>🖨️</span>
                                  <span>{printer.name}</span>
                                  {caps?.color && (
                                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                                      Color
                                    </span>
                                  )}
                                  {caps?.duplex && (
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                                      Duplex
                                    </span>
                                  )}
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">
                              No hardware printers registered yet.
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
      </div>
    </main>
  );
}

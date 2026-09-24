'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';

interface OverviewMetrics {
  totalUsers: number;
  totalShops: number;
  totalOrders: number;
  totalGMV: number;
  platformRevenue: number;
  activeQueue: number;
  completedOrders: number;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  _count?: { orders: number };
}

interface ShopItem {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string;
  active: boolean;
  feePercentage: number;
  owner?: { name: string; email: string };
  _count?: { orders: number };
}

interface OrderItem {
  id: string;
  orderNumber: string;
  title: string;
  status: string;
  estimatedPrice: number;
  createdAt: string;
  documentUrl: string;
  shop?: { name: string };
  customer?: { name: string };
}

export default function AdminDashboard() {
  const [userRole, setUserRole] = useState('ADMIN');
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'SHOPS' | 'ORDERS' | 'PRIVACY'>('OVERVIEW');

  // Data states
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleanupMessage, setCleanupMessage] = useState('');
  const [cleaning, setCleaning] = useState(false);

  function loadAdminData() {
    const token = localStorage.getItem('paprez_token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('/api/admin/overview', { headers }).then((res) => (res.ok ? res.json() : null)),
      fetch('/api/admin/users', { headers }).then((res) => (res.ok ? res.json() : null)),
      fetch('/api/admin/shops', { headers }).then((res) => (res.ok ? res.json() : null)),
      fetch('/api/orders', { headers }).then((res) => (res.ok ? res.json() : null))
    ])
      .then(([overviewData, usersData, shopsData, ordersData]) => {
        if (overviewData?.metrics) setMetrics(overviewData.metrics);
        if (usersData?.users) setUsers(usersData.users);
        if (shopsData?.shops) setShops(shopsData.shops);
        if (ordersData?.orders) setOrders(ordersData.orders);
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

  async function handleToggleUserStatus(userId: string, currentActive: boolean) {
    const token = localStorage.getItem('paprez_token');
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, active: !currentActive })
    });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active: !currentActive } : u)));
  }

  async function handleChangeUserRole(userId: string, newRole: string) {
    const token = localStorage.getItem('paprez_token');
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, role: newRole })
    });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  }

  async function handleToggleShopStatus(shopId: string, currentActive: boolean) {
    const token = localStorage.getItem('paprez_token');
    await fetch('/api/admin/shops', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ shopId, active: !currentActive })
    });
    setShops((prev) => prev.map((s) => (s.id === shopId ? { ...s, active: !currentActive } : s)));
  }

  async function handleUpdateShopFee(shopId: string, newFee: number) {
    const token = localStorage.getItem('paprez_token');
    await fetch('/api/admin/shops', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ shopId, feePercentage: newFee })
    });
    setShops((prev) => prev.map((s) => (s.id === shopId ? { ...s, feePercentage: newFee } : s)));
  }

  async function handleOrderOverride(orderId: string, newStatus: string) {
    const token = localStorage.getItem('paprez_token');
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
  }

  async function triggerRetentionCleanup() {
    setCleaning(true);
    setCleanupMessage('');
    try {
      const token = localStorage.getItem('paprez_token');
      const res = await fetch('/api/admin/retention/cleanup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCleanupMessage(data.message || 'Cleanup completed.');
      loadAdminData();
    } catch (err: any) {
      setCleanupMessage('Error executing retention cleanup.');
    } finally {
      setCleaning(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          <Sidebar role={userRole} />

          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-purple-600 font-extrabold">PAPrez Central Operating Authority</p>
                  <h1 className="mt-1 text-3xl font-black text-slate-950">Super Admin Control Center</h1>
                  <p className="text-xs text-slate-500 mt-1">Platform Multi-Tenant Governance & Operational Oversight</p>
                </div>

                {/* Tabs Selector */}
                <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  {[
                    { id: 'OVERVIEW', label: 'Overview' },
                    { id: 'USERS', label: `Users (${users.length})` },
                    { id: 'SHOPS', label: `Shops (${shops.length})` },
                    { id: 'ORDERS', label: `Orders (${orders.length})` },
                    { id: 'PRIVACY', label: 'Privacy & Storage' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-2 rounded-xl transition ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase">Gross Platform Volume</p>
                    <p className="mt-2 text-3xl font-black text-purple-600">₹{metrics?.totalGMV || 0}</p>
                    <p className="mt-1 text-[11px] text-slate-500">All orders processed</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase">Platform Revenue (Net)</p>
                    <p className="mt-2 text-3xl font-black text-emerald-600">₹{metrics?.platformRevenue || 0}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Commission earnings</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase">Registered Shops</p>
                    <p className="mt-2 text-3xl font-black text-blue-600">{metrics?.totalShops || 0}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Active print hubs</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase">Active Queue Jobs</p>
                    <p className="mt-2 text-3xl font-black text-amber-600">{metrics?.activeQueue || 0}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Currently in printing</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-950 mb-3">Live Platform Summary</h2>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    PAPREZ is operating in multi-tenant mode across {shops.length} print shops. All counter orders, payment webhooks, and automatic document retention lifecycles are monitored below.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: USERS MANAGEMENT */}
            {activeTab === 'USERS' && (
              <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-black text-slate-950">Platform Users & Roles</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold">
                        <th className="py-3 px-3">User</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Total Orders</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/60">
                          <td className="py-3.5 px-3">
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                          </td>
                          <td className="py-3.5 px-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-xs outline-none"
                            >
                              <option value="CUSTOMER">CUSTOMER</option>
                              <option value="SHOP_OWNER">SHOP_OWNER</option>
                              <option value="DELIVERY_AGENT">DELIVERY_AGENT</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.active
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {u.active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">{u._count?.orders || 0}</td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(u.id, u.active)}
                              className={`px-3 py-1 rounded-xl font-bold text-xs transition ${
                                u.active
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {u.active ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: SHOPS MANAGEMENT */}
            {activeTab === 'SHOPS' && (
              <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-black text-slate-950">Print Shops Fleet</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold">
                        <th className="py-3 px-3">Shop</th>
                        <th className="py-3 px-3">Owner</th>
                        <th className="py-3 px-3">Counter URL</th>
                        <th className="py-3 px-3">Platform Fee %</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {shops.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60">
                          <td className="py-3.5 px-3">
                            <p className="font-bold text-slate-900">{s.name}</p>
                            <p className="text-[11px] text-slate-500">📍 {s.city}</p>
                          </td>
                          <td className="py-3.5 px-3">{s.owner?.name || 'Assigned'}</td>
                          <td className="py-3.5 px-3 font-mono text-[11px] text-blue-600">
                            <a href={`/shop/${s.slug}`} target="_blank" rel="noreferrer" className="underline">
                              /shop/{s.slug} ↗
                            </a>
                          </td>
                          <td className="py-3.5 px-3">
                            <input
                              type="number"
                              min={0}
                              max={50}
                              defaultValue={s.feePercentage}
                              onBlur={(e) => handleUpdateShopFee(s.id, Number(e.target.value))}
                              className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-center font-bold"
                            />
                            %
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.active
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {s.active ? 'Accepting' : 'Paused / Suspended'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => handleToggleShopStatus(s.id, s.active)}
                              className={`px-3 py-1 rounded-xl font-bold text-xs transition ${
                                s.active
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {s.active ? 'Suspend' : 'Approve & Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: GLOBAL ORDERS */}
            {activeTab === 'ORDERS' && (
              <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-black text-slate-950">Global Order Operations</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold">
                        <th className="py-3 px-3">Order</th>
                        <th className="py-3 px-3">Shop</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Current Status</th>
                        <th className="py-3 px-3 text-right">Super Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/60">
                          <td className="py-3.5 px-3">
                            <span className="font-black text-blue-600">#{o.orderNumber}</span>
                            <p className="text-[11px] text-slate-600 truncate max-w-[180px]">{o.title}</p>
                          </td>
                          <td className="py-3.5 px-3">{o.shop?.name}</td>
                          <td className="py-3.5 px-3 font-bold text-slate-900">₹{o.estimatedPrice}</td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <select
                              value={o.status}
                              onChange={(e) => handleOrderOverride(o.id, e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-xs outline-none"
                            >
                              <option value="QUEUED">QUEUED</option>
                              <option value="ACCEPTED">ACCEPTED</option>
                              <option value="PRINTING">PRINTING</option>
                              <option value="READY_FOR_PICKUP">READY</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="REJECTED">REJECTED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: PRIVACY & RETENTION CLEANUP */}
            {activeTab === 'PRIVACY' && (
              <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Document Privacy & Storage Retention Janitor</h2>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    Under the PAPREZ Privacy-First mandate (Master Prompt Section 25), files are toxic assets. They are permanently purged upon verified handover, or purged after 72 hours for abandoned jobs.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                  <h3 className="font-black text-sm text-indigo-950">Automated Retention Rules Active</h3>
                  <ul className="text-xs text-indigo-900 space-y-1.5 list-disc list-inside">
                    <li>Completed Orders: Files purged immediately upon 4-digit pickup PIN entry.</li>
                    <li>Rejected Orders: Files purged immediately upon operator rejection.</li>
                    <li>Abandoned Orders: Files older than 72 hours purged by scheduled retention worker.</li>
                  </ul>
                </div>

                <div>
                  <button
                    onClick={triggerRetentionCleanup}
                    disabled={cleaning}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm shadow-md hover:shadow-lg transition disabled:opacity-50"
                  >
                    {cleaning ? 'Purging Expired Documents...' : '🧹 Run Immediate Storage Retention Purge'}
                  </button>

                  {cleanupMessage && (
                    <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      {cleanupMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

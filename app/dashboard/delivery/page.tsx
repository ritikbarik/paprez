'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';

interface Delivery {
  id: string;
  status: string;
  otpCode: string;
  pickupAddress: string;
  dropoffAddress: string;
  agentId?: string;
  order: { title: string; customer: { name: string }; shop: { name: string; address: string } };
}

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [otp, setOtp] = useState('');
  const [selected, setSelected] = useState<string>('');
  const [userRole, setUserRole] = useState('DELIVERY_AGENT');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem('paprez_user');
    if (user) setUserRole(JSON.parse(user).role);
    fetch('/api/deliveries', {
      headers: { Authorization: `Bearer ${localStorage.getItem('paprez_token')}` }
    })
      .then((res) => res.json())
      .then((data) => setDeliveries(data.deliveries || []));
  }, [mounted]);

  async function confirmDelivery() {
    if (!selected) return;
    await fetch('/api/deliveries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('paprez_token')}` },
      body: JSON.stringify({ deliveryId: selected, status: 'DELIVERED', otp })
    });
    const updated = deliveries.map((delivery) => (delivery.id === selected ? { ...delivery, status: 'DELIVERED' } : delivery));
    setDeliveries(updated);
    setOtp('');
  }

  async function requestPickup(deliveryId: string) {
    const res = await fetch('/api/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('paprez_token')}` },
      body: JSON.stringify({ deliveryId })
    });

    if (!res.ok) return;

    const data = await res.json();
    setDeliveries((current) => current.map((delivery) => (delivery.id === deliveryId ? data.delivery : delivery)));
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'APPROVED_FOR_PICKUP':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'IN_TRANSIT':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'DELIVERED':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          <Sidebar role={userRole} />
          
          <div className="flex-1 space-y-8">
            {/* Header */}
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-amber-600 font-semibold">Delivery Board</p>
                  <h1 className="mt-2 text-3xl sm:text-4xl font-black text-slate-950">Your jobs</h1>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 border border-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-slate-700">Live</span>
                </div>
              </div>
            </div>

            {/* Deliveries List */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-950">Available deliveries</h2>
                <span className="text-sm text-slate-500">{deliveries.length} total</span>
              </div>

              {deliveries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center">
                  <p className="text-slate-600">No deliveries assigned yet.</p>
                  <p className="mt-1 text-sm text-slate-500">Check back soon for new pickup requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className={`group rounded-2xl border-2 p-4 sm:p-5 transition ${
                        selected === delivery.id
                          ? 'border-amber-400 bg-amber-50/50 shadow-md'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-950 truncate text-sm sm:text-base">{delivery.order.title}</h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                delivery.status
                              )}`}
                            >
                              {delivery.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs sm:text-sm text-slate-600">
                            <p>👤 From: <span className="font-medium">{delivery.order.shop.name}</span></p>
                            <p>📦 Customer: <span className="font-medium">{delivery.order.customer.name}</span></p>
                            <p>📍 Pickup: <span className="font-medium">{delivery.pickupAddress}</span></p>
                            <p>📌 Dropoff: <span className="font-medium">{delivery.dropoffAddress}</span></p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-col sm:flex-col">
                          {delivery.status === 'OPEN' ? (
                            <button
                              onClick={() => requestPickup(delivery.id)}
                              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.4)] transition whitespace-nowrap"
                            >
                              Request pickup
                            </button>
                          ) : delivery.status === 'DELIVERED' ? (
                            <span className="px-4 py-2 rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-700 text-center">
                              ✓ Completed
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelected(delivery.id)}
                              className={`px-4 py-2 rounded-2xl text-sm font-bold transition whitespace-nowrap ${
                                selected === delivery.id
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              {selected === delivery.id ? 'Selected' : 'Select'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* OTP Verification Section */}
            {selected && (
              <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-950">Verify delivery</h2>
                <p className="mt-2 text-slate-600 text-sm">Enter the OTP from the customer to complete this delivery.</p>
                <div className="mt-6 flex flex-col gap-4 sm:gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-semibold text-slate-900">OTP code</label>
                    <input
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      placeholder="Enter 6-digit OTP"
                      type="text"
                      maxLength={6}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 transition font-mono text-lg"
                    />
                  </div>
                  <button
                    onClick={confirmDelivery}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-bold text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)] transition"
                  >
                    Mark delivered
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

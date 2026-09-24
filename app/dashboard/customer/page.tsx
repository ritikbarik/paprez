'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';

interface Order {
  id: string;
  title: string;
  status: string;
  shop: { name: string };
  estimatedPrice: number;
  urgency: boolean;
  pickupMethod: string;
  delivery?: { status: string } | null;
}

export default function CustomerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('CUSTOMER');
  const [mounted, setMounted] = useState(false);
  const [documentText, setDocumentText] = useState('');
  const [editInstruction, setEditInstruction] = useState('Fix grammar and make it print-ready.');
  const [pageRange, setPageRange] = useState('1-5');
  const [aiResult, setAiResult] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem('paprez_user');
    if (user) setUserRole(JSON.parse(user).role);
    setLoading(true);
    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${localStorage.getItem('paprez_token')}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
      })
      .finally(() => setLoading(false));
  }, [mounted]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'COMPLETED':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'DELIVERED':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'CANCELLED':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      default:
        return 'bg-amber-50 border-amber-200 text-amber-700';
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          <Sidebar role={userRole} />
          
          <div className="flex-1 space-y-8">
            {/* Header */}
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Customer Dashboard</p>
                  <h1 className="mt-2 text-3xl sm:text-4xl font-black text-slate-950">Your print orders</h1>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 border border-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-slate-700">Live</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-slate-600 font-medium">Active Orders</p>
                <p className="mt-3 text-3xl font-black text-blue-600">{orders.length}</p>
                <p className="mt-1 text-xs text-slate-500">Pending delivery</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-slate-600 font-medium">Recent Shop</p>
                <p className="mt-3 text-lg font-black text-indigo-600 truncate">{orders[0]?.shop.name || '—'}</p>
                <p className="mt-1 text-xs text-slate-500">Last used</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-slate-600 font-medium">Est. Total</p>
                <p className="mt-3 text-3xl font-black text-violet-600">₹{orders[0]?.estimatedPrice ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500">Latest order</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">AI document editor</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">Upload, select a range, and revise</h2>
                </div>
                <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">Print-ready assistant</span>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-4">
                  <label className="block rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5 text-center">
                    <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleDocumentUpload} className="sr-only" />
                    <span className="block text-sm font-black text-blue-700">Upload PDF, DOC, DOCX, or TXT</span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">10MB max. Text files can be edited immediately.</span>
                  </label>
                  {uploadStatus && <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">{uploadStatus}</p>}
                  <div>
                    <label className="text-sm font-bold text-slate-900">Page/data range</label>
                    <input
                      value={pageRange}
                      onChange={(event) => setPageRange(event.target.value)}
                      placeholder="1-5 or 1,3,7-9"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-900">AI instruction</label>
                    <textarea
                      value={editInstruction}
                      onChange={(event) => setEditInstruction(event.target.value)}
                      rows={4}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAiEdit}
                    disabled={aiLoading || !documentText.trim()}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {aiLoading ? 'Editing...' : 'Edit with AI'}
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <textarea
                    value={documentText}
                    onChange={(event) => setDocumentText(event.target.value)}
                    placeholder="Paste extracted document text here..."
                    className="min-h-[280px] rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm font-medium leading-6 text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <textarea
                    value={aiResult}
                    onChange={(event) => setAiResult(event.target.value)}
                    placeholder="AI-edited output appears here..."
                    className="min-h-[280px] rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium leading-6 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-950">Recent orders</h2>
                <span className="text-sm text-slate-500">{orders.length} total</span>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <p className="text-slate-600 animate-pulse">Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center">
                  <p className="text-slate-600">No orders yet.</p>
                  <p className="mt-1 text-sm text-slate-500">Place your first print request to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 hover:bg-white hover:border-blue-200 hover:shadow-md transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-950 truncate text-sm sm:text-base">{order.title}</h3>
                          <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-slate-600 flex-wrap">
                            <span className="inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                              {order.shop.name}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span>{order.pickupMethod === 'delivery' ? '🚗 Delivery' : '📍 Pickup'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                          {order.urgency && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
                              🔥 Urgent
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                              getStatusColor(order.status)
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-200">
                        <p className="text-sm font-medium text-slate-600">
                          {order.delivery ? `📦 ${order.delivery.status}` : '⏳ In queue'}
                        </p>
                        <p className="font-bold text-slate-950">₹{order.estimatedPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

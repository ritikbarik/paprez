'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ShopData {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  active: boolean;
  latitude?: number;
  longitude?: number;
  operatingHours?: string;
  services?: string[];
  queueCount: number;
  pricing: {
    bwSingle: number;
    bwDuplex: number;
    colorSingle: number;
    colorDuplex: number;
    spiralBinding: number;
    stapleBinding: number;
    rushFee: number;
  };
  printers?: {
    id: string;
    name: string;
    model?: string;
    status: string;
    capabilities?: { color?: boolean; duplex?: boolean; sizes?: string[] };
  }[];
  printersCount: number;
}

interface PriceCalc {
  pageCount: number;
  copies: number;
  ratePerPage: number;
  printSubtotal: number;
  bindingCost: number;
  rushCost: number;
  total: number;
}

export default function ShopOrderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [shop, setShop] = useState<ShopData | null>(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [error, setError] = useState('');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    storageKey: string;
    fileName: string;
    pageCount: number;
    bytes: number;
  } | null>(null);

  // Print settings
  const [color, setColor] = useState(false);
  const [doubleSided, setDoubleSided] = useState(true);
  const [copies, setCopies] = useState(1);
  const [paperSize, setPaperSize] = useState('A4');
  const [binding, setBinding] = useState('none');
  const [pageRange, setPageRange] = useState('all');
  const [isRush, setIsRush] = useState(false);

  // Customer info & notes
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  // Live price
  const [priceCalc, setPriceCalc] = useState<PriceCalc | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    fetch(`/api/shops/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Shop not found');
        return res.json();
      })
      .then((data) => {
        setShop(data.shop);
      })
      .catch((err) => {
        setError(err.message || 'Could not load print shop.');
      })
      .finally(() => setLoadingShop(false));
  }, [slug]);

  // Recalculate price whenever settings or uploaded page count change
  useEffect(() => {
    if (!shop) return;
    const pageCount = uploadedFile?.pageCount || 1;

    fetch('/api/orders/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId: shop.id,
        pageCount,
        color,
        doubleSided,
        copies,
        binding,
        isRush
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.calculation) setPriceCalc(data.calculation);
      })
      .catch(() => {});
  }, [shop, uploadedFile, color, doubleSided, copies, binding, isRush]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          contentBase64: base64
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed.');
      }

      setUploadedFile({
        url: data.url,
        storageKey: data.storageKey,
        fileName: data.fileName || file.name,
        pageCount: data.pageCount || 1,
        bytes: data.bytes || file.size
      });
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setUploading(false);
    }
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!shop || !uploadedFile) {
      setError('Please upload a document to proceed.');
      return;
    }

    if (!customerPhone || customerPhone.trim().length < 8) {
      setError('Please provide a valid mobile number for your pickup PIN notification.');
      return;
    }

    setSubmittingOrder(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          title: uploadedFile.fileName,
          notes,
          pickupMethod: 'pickup',
          estimatedPrice: priceCalc?.total || 10,
          documentUrl: uploadedFile.url,
          storageKey: uploadedFile.storageKey,
          pageCount: uploadedFile.pageCount,
          urgency: isRush,
          customerPhone: customerPhone.trim(),
          customerName: customerName.trim() || 'Guest Customer',
          printSetting: {
            color,
            doubleSided,
            copies,
            pageRange,
            paperSize,
            binding
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Redirect directly to customer order tracking page
      router.push(`/order/${data.order.id}`);
    } catch (err: any) {
      setError(err.message || 'Error creating order.');
      setSubmittingOrder(false);
    }
  }

  if (loadingShop) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Connecting to Print Hub...</p>
        </div>
      </main>
    );
  }

  if (!shop || error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
          <div className="h-14 w-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl mb-4 font-black">
            ✕
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">Print Shop Not Found</h1>
          <p className="text-sm text-slate-600 mb-6">{error || 'The requested shop does not exist or has moved.'}</p>
          <Link
            href="/"
            className="inline-block w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition"
          >
            Go to PAPrez Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 text-slate-900 pb-16">
      {/* Top Shop Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              P
            </span>
            <span className="font-black text-lg text-slate-950">PAPrez</span>
          </Link>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
              shop.active
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${shop.active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}
            />
            {shop.active ? 'ACCEPTING ORDERS' : 'ORDERS PAUSED'}
          </span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Shop Info Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider text-blue-600">Print Shop Counter</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950">{shop.name}</h1>
              <p className="text-xs text-slate-600 mt-1">📍 {shop.address}, {shop.city}</p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span className="text-xs text-slate-500 font-bold block">🕒 Hours</span>
              <span className="text-xs font-black text-slate-900">{shop.operatingHours || '8:00 AM - 10:00 PM'}</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 flex-wrap gap-2">
            <span>⚡ Active Queue: <strong className="text-blue-600 font-bold">{shop.queueCount} jobs</strong></span>
            <span>⏱️ Est. Wait: <strong className="text-slate-900 font-bold">{shop.queueCount === 0 ? '~2 mins' : `~${shop.queueCount * 3} mins`}</strong></span>
            <a href={`tel:${shop.phone}`} className="text-blue-600 hover:underline">📞 {shop.phone}</a>
          </div>

          {/* Available Services Badges */}
          {shop.services && shop.services.length > 0 && (
            <div className="pt-2">
              <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2">Services Available</p>
              <div className="flex flex-wrap gap-1.5">
                {shop.services.map((svc) => (
                  <span
                    key={svc}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold"
                  >
                    ✓ {svc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attached Hardware & Printers */}
          {shop.printers && shop.printers.length > 0 && (
            <div className="pt-2">
              <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2">Hardware & Printer Fleet</p>
              <div className="space-y-1.5">
                {shop.printers.map((printer) => (
                  <div key={printer.id} className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-black text-slate-900">{printer.name}</p>
                      <p className="text-[10px] text-slate-500">{printer.model || 'Network Spooler'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {printer.capabilities?.duplex && (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-black text-[10px]">Auto Duplex</span>
                      )}
                      {printer.capabilities?.color ? (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-black text-[10px]">Color</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-black text-[10px]">B&W</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exact Map Location Card */}
          {shop.latitude && shop.longitude && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Exact Counter Location</p>
                <a
                  href={`https://www.openstreetmap.org/directions?from=&to=${shop.latitude}%2C${shop.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Get Directions ↗
                </a>
              </div>
              <div className="h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                <iframe
                  title="Shop OpenStreetMap Embed"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${(shop.longitude || 85.8245) - 0.007}%2C${(shop.latitude || 20.2961) - 0.005}%2C${(shop.longitude || 85.8245) + 0.007}%2C${(shop.latitude || 20.2961) + 0.005}&layer=mapnik&marker=${shop.latitude}%2C${shop.longitude}`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>

        {/* If Shop Paused Alert */}
        {!shop.active && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <span>⚠️</span> Shop is Currently Paused
            </h3>
            <p className="text-xs mt-1 leading-relaxed">
              The shopkeeper has temporarily paused incoming orders to clear the current queue. Please check back in a few minutes or order in person.
            </p>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-6">
          {/* Step 1: Upload Document */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-slate-950 flex items-center gap-2 text-base">
                <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
                  1
                </span>
                Upload Document
              </h2>
              <span className="text-xs font-bold text-slate-500">PDF, Word, PPTX, Images</span>
            </div>

            {!uploadedFile ? (
              <label
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                  uploading
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.pptx,.txt,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  disabled={uploading || !shop.active}
                  className="sr-only"
                />
                <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-3 shadow-inner">
                  📄
                </div>
                <span className="font-black text-slate-900 text-sm">
                  {uploading ? 'Reading & Counting Pages...' : 'Tap to Upload Document'}
                </span>
                <span className="text-xs text-slate-500 mt-1">Files up to 25MB supported</span>
              </label>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-black text-[10px]">
                      READY
                    </span>
                    <p className="font-bold text-slate-950 text-sm truncate">{uploadedFile.fileName}</p>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    📄 <strong>{uploadedFile.pageCount} Pages detected</strong> •{' '}
                    {(uploadedFile.bytes / 1024).toFixed(0)} KB
                  </p>
                </div>
                <label className="ml-3 text-xs font-black text-blue-600 hover:text-blue-700 cursor-pointer shrink-0">
                  Change
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.pptx,.txt,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Step 2: Print Settings */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="font-black text-slate-950 flex items-center gap-2 text-base">
              <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
                2
              </span>
              Print Options
            </h2>

            {/* Color Mode */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">Color Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setColor(false)}
                  className={`p-3 rounded-2xl border text-center font-bold text-sm transition ${
                    !color
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  🖤 Black & White (₹{shop.pricing.bwSingle}/pg)
                </button>
                <button
                  type="button"
                  onClick={() => setColor(true)}
                  className={`p-3 rounded-2xl border text-center font-bold text-sm transition ${
                    color
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  🌈 Full Color (₹{shop.pricing.colorSingle}/pg)
                </button>
              </div>
            </div>

            {/* Sides */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">Print Sides</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDoubleSided(true)}
                  className={`p-3 rounded-2xl border text-center font-bold text-sm transition ${
                    doubleSided
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  📑 Double-Sided (Duplex)
                </button>
                <button
                  type="button"
                  onClick={() => setDoubleSided(false)}
                  className={`p-3 rounded-2xl border text-center font-bold text-sm transition ${
                    !doubleSided
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  📄 Single-Sided
                </button>
              </div>
            </div>

            {/* Copies & Paper Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">Copies</label>
                <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="p-3 text-slate-700 font-bold hover:bg-slate-100 rounded-l-2xl"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-black text-sm">{copies}</span>
                  <button
                    type="button"
                    onClick={() => setCopies(copies + 1)}
                    className="p-3 text-slate-700 font-bold hover:bg-slate-100 rounded-r-2xl"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">Paper Size</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="A4">A4 (Standard)</option>
                  <option value="A3">A3 (Large)</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
            </div>

            {/* Binding Options */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">Binding</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'None', price: 0 },
                  { id: 'stapled', label: 'Stapled', price: shop.pricing.stapleBinding },
                  { id: 'spiral', label: 'Spiral', price: shop.pricing.spiralBinding }
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBinding(b.id)}
                    className={`p-2.5 rounded-2xl border text-center text-xs font-bold transition ${
                      binding === b.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {b.label} {b.price > 0 && `(+₹${b.price})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Rush Priority Toggle */}
            <div className="pt-2">
              <label
                onClick={() => setIsRush(!isRush)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  isRush
                    ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-400/20'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🔥</span>
                  <div>
                    <p className="font-bold text-slate-950 text-xs">Rush / Priority Processing (+₹{shop.pricing.rushFee})</p>
                    <p className="text-[11px] text-slate-500">Jump ahead in queue for urgent deadlines</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isRush}
                  onChange={(e) => setIsRush(e.target.checked)}
                  className="h-5 w-5 accent-amber-500 rounded"
                />
              </label>
            </div>
          </div>

          {/* Step 3: Customer Details & Notes */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-black text-slate-950 flex items-center gap-2 text-base">
              <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
                3
              </span>
              Pickup Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Your 4-digit pickup PIN will be sent here</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instructions for Shopkeeper (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Staple top-left corner, print landscape"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Step 4: Transparent Price Breakdown & Checkout */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Transparent Price Breakdown</h3>

            <div className="space-y-2 text-sm text-slate-700 pt-1">
              <div className="flex justify-between">
                <span>
                  Printing ({uploadedFile ? uploadedFile.pageCount : 1} pgs × ₹{priceCalc?.ratePerPage || 2} × {copies} copy)
                </span>
                <span className="font-bold text-slate-900">₹{priceCalc?.printSubtotal || 0}</span>
              </div>

              {priceCalc && priceCalc.bindingCost > 0 && (
                <div className="flex justify-between">
                  <span>Binding ({binding})</span>
                  <span className="font-bold text-slate-900">+₹{priceCalc.bindingCost}</span>
                </div>
              )}

              {isRush && (
                <div className="flex justify-between text-amber-700">
                  <span>Priority Rush Processing</span>
                  <span className="font-bold">+₹{priceCalc?.rushCost || shop.pricing.rushFee}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-lg font-black text-slate-950">
                <span>Total Amount</span>
                <span className="text-2xl text-blue-600">₹{priceCalc?.total || 0}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submittingOrder || !shop.active || !uploadedFile}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-black text-base shadow-[0_12px_24px_rgba(79,70,229,0.3)] hover:shadow-[0_16px_32px_rgba(79,70,229,0.4)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingOrder ? 'Placing Order...' : `Pay ₹${priceCalc?.total || 0} & Join Queue →`}
            </button>

            {/* Privacy Guarantee Note */}
            <p className="text-[11px] text-center text-slate-500 font-medium pt-2">
              🔒 <strong>Zero WhatsApp/USB Retention:</strong> Your document is securely encrypted and permanently deleted immediately after pickup verification.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

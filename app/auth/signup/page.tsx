'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type RoleType = 'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_AGENT' | 'ADMIN';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleType>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Shop Owner specific onboarding fields
  const [shopName, setShopName] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopCity, setShopCity] = useState('Bhubaneswar');
  const [shopPhone, setShopPhone] = useState('');

  // Map Coordinates & Location
  const [latitude, setLatitude] = useState(20.2961);
  const [longitude, setLongitude] = useState(85.8245);
  const [detectingGps, setDetectingGps] = useState(false);

  // Printer Properties
  const [printerName, setPrinterName] = useState('HP LaserJet Pro M404dn');
  const [printerModel, setPrinterModel] = useState('High-Speed Monochrome Laser');
  const [hasColor, setHasColor] = useState(true);
  const [hasDuplex, setHasDuplex] = useState(true);
  const [supportedSizes, setSupportedSizes] = useState<string[]>(['A4', 'Legal']);

  // Printing & Services Rates
  const [bwSingle, setBwSingle] = useState(2);
  const [bwDuplex, setBwDuplex] = useState(3);
  const [colorSingle, setColorSingle] = useState(10);
  const [colorDuplex, setColorDuplex] = useState(18);
  const [spiralPrice, setSpiralPrice] = useState(30);
  const [staplePrice, setStaplePrice] = useState(10);
  const [laminationPrice, setLaminationPrice] = useState(20);
  const [rushFee, setRushFee] = useState(20);
  const [operatingHours, setOperatingHours] = useState('8:00 AM - 10:00 PM');

  useEffect(() => {
    const selectedRole = new URLSearchParams(window.location.search).get('role') as RoleType | null;
    if (selectedRole && ['CUSTOMER', 'SHOP_OWNER', 'DELIVERY_AGENT', 'ADMIN'].includes(selectedRole)) {
      setRole(selectedRole);
    }
  }, []);

  function handleDetectGps() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
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
        setError('Could not retrieve current location. You can enter latitude and longitude manually.');
      }
    );
  }

  function handleToggleSize(size: string) {
    if (supportedSizes.includes(size)) {
      setSupportedSizes(supportedSizes.filter((s) => s !== size));
    } else {
      setSupportedSizes([...supportedSizes, size]);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const payload: any = {
      name,
      email,
      password,
      role
    };

    if (role === 'SHOP_OWNER') {
      if (!shopName.trim()) {
        setError('Please enter your print shop name.');
        setLoading(false);
        return;
      }

      payload.shopName = shopName.trim();
      payload.shopSlug = (shopSlug || shopName).toLowerCase().replace(/[^a-z0-9]/g, '-');
      payload.shopAddress = shopAddress || 'Shop address';
      payload.shopCity = shopCity || 'Bhubaneswar';
      payload.shopPhone = shopPhone || '+91 98765 00000';
      payload.latitude = latitude;
      payload.longitude = longitude;
      payload.operatingHours = operatingHours;
      payload.services = [
        'B&W Printing',
        hasColor ? 'Full Color Printing' : '',
        hasDuplex ? 'Duplex Printing' : '',
        'Spiral Binding',
        'Staple Binding',
        'Lamination',
        'Rush Priority'
      ].filter(Boolean);
      payload.pricingRules = {
        bwSingle,
        bwDuplex,
        colorSingle,
        colorDuplex,
        spiralBinding: spiralPrice,
        stapleBinding: staplePrice,
        lamination: laminationPrice,
        rushFee
      };
      payload.printerName = printerName;
      payload.printerModel = printerModel;
      payload.printerCapabilities = {
        color: hasColor,
        duplex: hasDuplex,
        sizes: supportedSizes
      };
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Signup failed.');
        return;
      }

      localStorage.setItem('paprez_token', data.token);
      localStorage.setItem('paprez_user', JSON.stringify(data.user));

      const route =
        role === 'SHOP_OWNER'
          ? '/dashboard/print-shop'
          : role === 'DELIVERY_AGENT'
          ? '/dashboard/delivery'
          : role === 'ADMIN'
          ? '/dashboard/admin'
          : '/dashboard/customer';

      router.push(route);
    } catch (err: any) {
      setLoading(false);
      setError('Registration error. Please try again.');
    }
  }

  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.008}%2C${latitude - 0.006}%2C${longitude + 0.008}%2C${latitude + 0.006}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-12 flex items-center justify-center">
      <div className={`w-full ${role === 'SHOP_OWNER' ? 'max-w-2xl' : 'max-w-md'} transition-all`}>
        <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-6 sm:p-8 shadow-[0_20px_60px_rgba(49,65,130,0.08)]">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                P
              </span>
              <span className="text-xl font-black text-slate-950">PAPrez</span>
            </Link>

            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Registration
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Create an Account</h1>
            <p className="mt-1 text-slate-600 text-xs sm:text-sm">Select your role to get started with the PAPREZ operating system</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">I am registering as:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'CUSTOMER', label: 'Customer', icon: '👤' },
                { id: 'SHOP_OWNER', label: 'Shop Owner', icon: '🏪' },
                { id: 'DELIVERY_AGENT', label: 'Delivery', icon: '🚚' },
                { id: 'ADMIN', label: 'Admin', icon: '🛡️' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as RoleType)}
                  className={`p-3 rounded-2xl border text-center transition font-bold text-xs flex flex-col items-center gap-1 ${
                    role === r.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-500/10'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-xl">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Common User Account Fields */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            {/* SHOP OWNER SPECIFIC ONBOARDING SECTION */}
            {role === 'SHOP_OWNER' && (
              <div className="space-y-6 pt-4 border-t border-slate-200">
                <div>
                  <span className="text-xs uppercase font-black tracking-wider text-blue-600 block">Print Shop Setup</span>
                  <h2 className="text-lg font-black text-slate-950 mt-0.5">Shop Location, Hardware & Services</h2>
                  <p className="text-xs text-slate-500">Provide your shop's exact location, printer capabilities, and pricing</p>
                </div>

                {/* Section A: Shop Details */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">1. Shop Identity</h3>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Shop Name *</label>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => {
                          setShopName(e.target.value);
                          if (!shopSlug) setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                        }}
                        placeholder="e.g. Apex Digital Xerox"
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Counter URL Slug</label>
                      <div className="flex items-center rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-mono text-slate-500">
                        <span>/shop/</span>
                        <input
                          type="text"
                          value={shopSlug}
                          onChange={(e) => setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))}
                          placeholder="apex-xerox"
                          className="w-full py-2.5 px-1 text-slate-900 font-bold outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Shop Address</label>
                      <input
                        type="text"
                        value={shopAddress}
                        onChange={(e) => setShopAddress(e.target.value)}
                        placeholder="Shop 12, Gate 2, Campus Road"
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">City</label>
                      <input
                        type="text"
                        value={shopCity}
                        onChange={(e) => setShopCity(e.target.value)}
                        placeholder="Bhubaneswar"
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={shopPhone}
                        onChange={(e) => setShopPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Operating Hours</label>
                      <input
                        type="text"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(e.target.value)}
                        placeholder="8:00 AM - 10:00 PM"
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Exact Map Location */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">2. Exact Counter Location on Map</h3>
                      <p className="text-[11px] text-slate-500">Customers will see this pin to navigate to your print shop</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDetectGps}
                      disabled={detectingGps}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <span>📍</span>
                      {detectingGps ? 'Detecting GPS...' : 'Detect My GPS'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Real-time Map Preview */}
                  <div className="h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                    <iframe
                      title="Shop Location on OpenStreetMap"
                      src={mapEmbedUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Section C: Printer Properties */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">3. Primary Printer Properties</h3>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Printer Name</label>
                      <input
                        type="text"
                        value={printerName}
                        onChange={(e) => setPrinterName(e.target.value)}
                        placeholder="e.g. HP LaserJet Enterprise M608dn"
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Model / Type</label>
                      <input
                        type="text"
                        value={printerModel}
                        onChange={(e) => setPrinterModel(e.target.value)}
                        placeholder="e.g. Heavy-Duty Duplex Network Printer"
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Capabilities Toggles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasDuplex}
                        onChange={(e) => setHasDuplex(e.target.checked)}
                        className="h-4 w-4 accent-blue-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-800">Auto Duplex</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasColor}
                        onChange={(e) => setHasColor(e.target.checked)}
                        className="h-4 w-4 accent-blue-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-800">Color Printing</span>
                    </label>

                    {['A4', 'A3', 'Legal'].map((size) => (
                      <label key={size} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={supportedSizes.includes(size)}
                          onChange={() => handleToggleSize(size)}
                          className="h-4 w-4 accent-blue-600 rounded"
                        />
                        <span className="text-xs font-bold text-slate-800">{size} Paper</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section D: Pricing & Available Services */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">4. Printing Rates & Services (₹)</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">B&W Single (₹)</label>
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={bwSingle}
                        onChange={(e) => setBwSingle(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">B&W Duplex (₹)</label>
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={bwDuplex}
                        onChange={(e) => setBwDuplex(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Color Single (₹)</label>
                      <input
                        type="number"
                        min={1}
                        value={colorSingle}
                        onChange={(e) => setColorSingle(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Color Duplex (₹)</label>
                      <input
                        type="number"
                        min={1}
                        value={colorDuplex}
                        onChange={(e) => setColorDuplex(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-black text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Spiral Binding (₹)</label>
                      <input
                        type="number"
                        value={spiralPrice}
                        onChange={(e) => setSpiralPrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Staple Binding (₹)</label>
                      <input
                        type="number"
                        value={staplePrice}
                        onChange={(e) => setStaplePrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Lamination (₹)</label>
                      <input
                        type="number"
                        value={laminationPrice}
                        onChange={(e) => setLaminationPrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Rush Queue Fee (₹)</label>
                      <input
                        type="number"
                        value={rushFee}
                        onChange={(e) => setRushFee(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-black text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3">
                <p className="text-xs text-rose-700 font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_12px_24px_rgba(79,70,229,0.25)] hover:shadow-[0_16px_32px_rgba(79,70,229,0.35)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Creating Shop & Account...'
                : role === 'SHOP_OWNER'
                ? 'Register Print Shop & Open Counter →'
                : 'Create Account →'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Already registered?</span>
            <Link href="/auth/login" className="font-extrabold text-blue-600 hover:text-blue-700">
              Sign in to your terminal
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'How it Works', href: '/how-it-works' },
  { label: 'For Shops', href: '/for-shops' },
  { label: 'For Delivery', href: '/for-delivery' },
  { label: 'About Us', href: '/about-us' }
];

const steps = [
  'Upload your file and choose print settings.',
  'Pick a nearby print shop or let PAPrez suggest one.',
  'Track approval, printing, pickup and delivery in one place.'
];

function LogoMark() {
  return (
    <span className="relative block h-12 w-12 shrink-0">
      <span className="absolute left-1 top-0 h-3.5 w-9 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
      <span className="absolute left-1 top-0 h-10 w-3.5 rounded-full bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-500" />
      <span className="absolute left-3.5 top-3 h-4 w-7 rounded-r-full bg-gradient-to-r from-indigo-400 to-violet-500" />
      <span className="absolute left-1 bottom-0 h-4 w-3.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
    </span>
  );
}

function PublicNav({ active }: { active: string }) {
  return (
    <nav className="flex flex-col gap-5 rounded-[24px] border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_18px_50px_rgba(49,65,130,0.08)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <Link href="/" className="flex items-center gap-3">
        <LogoMark />
        <span>
          <span className="block text-3xl font-black leading-none text-[#080f3f]">PAPrez</span>
          <span className="block text-sm font-medium leading-tight text-[#555985]">Smart Printing Simplified.</span>
        </span>
      </Link>
      <div className="flex gap-4 overflow-x-auto text-sm font-bold text-[#080f3f] lg:gap-8">
        {navLinks.map((item) => (
          <Link key={item.href} href={item.href} className={`relative shrink-0 py-3 transition hover:text-blue-600 ${active === item.href ? 'text-blue-600' : ''}`}>
            {item.label}
            {active === item.href && <span className="absolute inset-x-0 bottom-1 h-0.5 rounded-full bg-blue-600" />}
          </Link>
        ))}
      </div>
      <Link href="/auth/signup" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(79,70,229,0.22)]">
        Create Account
      </Link>
    </nav>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#fbfcff] px-5 py-6 text-[#080f3f] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <PublicNav active="/how-it-works" />
        <section className="py-14 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">How it works</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Printing, without the messy middle.</h1>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(49,65,130,0.08)]">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-xl font-black text-white">{index + 1}</span>
                <p className="mt-5 text-lg font-bold text-[#111b4d]">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

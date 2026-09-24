import Link from 'next/link';

interface SidebarProps {
  role: string;
}

const navItems = {
  CUSTOMER: [
    { href: '/dashboard/customer', label: 'My Orders' },
    { href: '/dashboard/customer', label: 'Order History' }
  ],
  SHOP_OWNER: [
    { href: '/dashboard/print-shop', label: 'Incoming Orders' },
    { href: '/dashboard/print-shop', label: 'Earnings' }
  ],
  DELIVERY_AGENT: [
    { href: '/dashboard/delivery', label: 'Assigned Deliveries' },
    { href: '/dashboard/delivery', label: 'OTP Delivery' }
  ],
  ADMIN: [
    { href: '/dashboard/admin', label: 'Platform Overview' },
    { href: '/dashboard/admin', label: 'User Management' }
  ]
};

export function Sidebar({ role }: SidebarProps) {
  const items = navItems[role as keyof typeof navItems] ?? navItems.CUSTOMER;

  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 overflow-y-auto rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-glow xl:block">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
      <nav className="mt-6 space-y-3">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

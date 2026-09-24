'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function OAuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    const user = params.get('user');

    if (!token || !user) {
      router.replace('/auth/login?error=oauth');
      return;
    }

    const parsedUser = JSON.parse(decodeURIComponent(user));
    localStorage.setItem('paprez_token', token);
    localStorage.setItem('paprez_user', JSON.stringify(parsedUser));

    const route = parsedUser.role === 'SHOP_OWNER'
      ? '/dashboard/print-shop'
      : parsedUser.role === 'DELIVERY_AGENT'
        ? '/dashboard/delivery'
        : parsedUser.role === 'ADMIN'
          ? '/dashboard/admin'
          : '/dashboard/customer';

    router.replace(route);
  }, [params, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">OAuth</p>
        <h1 className="mt-3 text-2xl font-black text-slate-950">Signing you in...</h1>
      </div>
    </main>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">OAuth</p>
          <h1 className="mt-3 text-2xl font-black text-slate-950">Signing you in...</h1>
        </div>
      </main>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}

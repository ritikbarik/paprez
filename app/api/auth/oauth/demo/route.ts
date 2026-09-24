import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createToken, hashPassword } from '@/lib/auth';

const DEMO_EMAIL = 'oauth.customer@paprez.local';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = (url.searchParams.get('role') || 'CUSTOMER').toUpperCase();

  let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'OAuth Demo User',
        email: DEMO_EMAIL,
        password: await hashPassword(`oauth-demo-${Date.now()}`),
        role
      }
    });
  }

  const token = createToken({ userId: user.id, role: user.role });
  const callbackUrl = new URL('/auth/oauth/callback', url.origin);
  callbackUrl.searchParams.set('token', token);
  callbackUrl.searchParams.set('user', encodeURIComponent(JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  })));

  return NextResponse.redirect(callbackUrl);
}

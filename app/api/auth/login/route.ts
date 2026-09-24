import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createToken, verifyPassword } from '@/lib/auth';
import { syncUserCredentialsToSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  // Store & sync login credentials in Supabase Auth
  try {
    await syncUserCredentialsToSupabase(user.email, password, {
      name: user.name,
      role: user.role
    });
  } catch (e) {
    console.warn('Supabase sync warning during login:', e);
  }

  const token = createToken({ userId: user.id, role: user.role });
  const userData = { id: user.id, name: user.name, email: user.email, role: user.role };

  const response = NextResponse.json({
    token,
    user: userData
  });

  // Keep user logged in persistently (1 year maxAge) until explicit sign out
  response.cookies.set('paprez_token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 31536000,
    path: '/'
  });

  response.cookies.set('paprez_user', encodeURIComponent(JSON.stringify(userData)), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 31536000,
    path: '/'
  });

  return response;
}

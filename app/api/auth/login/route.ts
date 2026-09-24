import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createToken, verifyPassword } from '@/lib/auth';

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

  const token = createToken({ userId: user.id, role: user.role });
  const response = NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });

  // Keep user logged in persistently (1 year maxAge) until explicit sign out
  response.cookies.set('paprez_token', token, {
    httpOnly: false, // accessible to client scripts as well as HTTP requests
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 31536000,
    path: '/'
  });

  return response;
}

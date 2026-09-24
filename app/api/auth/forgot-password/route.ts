import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ message: 'If your email is registered, you will receive reset instructions.' });
  }

  await prisma.notification.create({
    data: {
      userId: user.id,
      message: 'Password reset requested. Use the app reset workflow to update credentials.',
      category: 'security'
    }
  });

  return NextResponse.json({ message: 'Password reset instructions sent if the email exists.' });
}

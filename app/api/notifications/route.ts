import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const notifications = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ notifications });
}

export async function PATCH(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { notificationId } = await request.json();
  if (!notificationId) {
    return NextResponse.json({ error: 'Missing notification ID.' }, { status: 400 });
  }

  const notification = await prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
  return NextResponse.json({ notification });
}

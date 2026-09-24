import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      active: true,
      createdAt: true,
      _count: {
        select: { orders: true }
      }
    }
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const { userId, role, active } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  const updates: any = {};
  if (role) updates.role = role;
  if (typeof active === 'boolean') updates.active = active;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updates
  });

  return NextResponse.json({ user: updatedUser });
}

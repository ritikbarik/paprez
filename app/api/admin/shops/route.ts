import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      owner: { select: { name: true, email: true } },
      printers: true,
      _count: { select: { orders: true } }
    }
  });

  return NextResponse.json({ shops });
}

export async function PATCH(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const { shopId, active, feePercentage, verified } = await request.json();
  if (!shopId) {
    return NextResponse.json({ error: 'Shop ID is required.' }, { status: 400 });
  }

  const updates: any = {};
  if (typeof active === 'boolean') updates.active = active;
  if (typeof verified === 'boolean') updates.verified = verified;
  if (typeof feePercentage === 'number') updates.feePercentage = feePercentage;

  const updatedShop = await prisma.shop.update({
    where: { id: shopId },
    data: updates
  });

  return NextResponse.json({ shop: updatedShop });
}

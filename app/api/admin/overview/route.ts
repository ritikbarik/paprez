import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const [totalUsers, totalShops, totalOrders, orders] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.order.count(),
    prisma.order.findMany({
      select: {
        estimatedPrice: true,
        status: true,
        shop: { select: { feePercentage: true } }
      }
    })
  ]);

  const totalGMV = orders.reduce((acc, o) => acc + (o.estimatedPrice || 0), 0);
  const platformRevenue = orders.reduce(
    (acc, o) => acc + ((o.estimatedPrice || 0) * (o.shop?.feePercentage || 10)) / 100,
    0
  );
  const activeQueue = orders.filter((o) => ['QUEUED', 'ACCEPTED', 'PRINTING'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;

  return NextResponse.json({
    metrics: {
      totalUsers,
      totalShops,
      totalOrders,
      totalGMV: Math.round(totalGMV),
      platformRevenue: Math.round(platformRevenue),
      activeQueue,
      completedOrders
    }
  });
}

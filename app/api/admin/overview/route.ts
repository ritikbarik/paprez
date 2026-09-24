import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const [totalUsers, totalShops, totalOrders, verifiedShops, orders] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.order.count(),
    prisma.shop.count({ where: { verified: true } }),
    prisma.order.findMany({
      select: {
        estimatedPrice: true,
        status: true,
        pageCount: true,
        shop: { select: { feePercentage: true } }
      }
    })
  ]);

  const totalGMV = orders.reduce((acc, o) => acc + (o.estimatedPrice || 0), 0);
  const totalPages = orders.reduce((acc, o) => acc + (o.pageCount || 1), 0);
  // Platform Commission: ₹0.20 per printed page
  const platformRevenue = Number((totalPages * 0.20).toFixed(2));
  const activeQueue = orders.filter((o) => ['QUEUED', 'ACCEPTED', 'PRINTING'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;

  return NextResponse.json({
    metrics: {
      totalUsers,
      totalShops,
      verifiedShops,
      totalOrders,
      totalPages,
      totalGMV: Math.round(totalGMV),
      platformRevenue,
      commissionPerUnit: 0.20,
      activeQueue,
      completedOrders
    }
  });
}

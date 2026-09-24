import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/utils';
import { deleteDocument } from '@/lib/supabase';

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  // Find orders that are COMPLETED, REJECTED, or older than 72 hours with an active documentUrl
  const retentionHours = Number(process.env.UPLOAD_RETENTION_HOURS || 72);
  const cutoffDate = new Date(Date.now() - retentionHours * 60 * 60 * 1000);

  const eligibleOrders = await prisma.order.findMany({
    where: {
      OR: [
        { status: { in: ['COMPLETED', 'REJECTED', 'CANCELLED'] } },
        { createdAt: { lt: cutoffDate } }
      ],
      documentUrl: {
        not: {
          in: ['[DELETED_AFTER_PICKUP]', '[PURGED]', '']
        }
      }
    }
  });

  let purgedCount = 0;
  for (const order of eligibleOrders) {
    if (order.storageKey || order.documentUrl) {
      await deleteDocument(order.storageKey || order.documentUrl);
      await prisma.order.update({
        where: { id: order.id },
        data: { documentUrl: '[DELETED_AFTER_PICKUP]' }
      });
      purgedCount++;
    }
  }

  return NextResponse.json({
    message: `Privacy retention cleanup completed. Purged ${purgedCount} document files.`,
    purgedCount
  });
}

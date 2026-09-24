import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, addNotification } from '@/lib/utils';
import { deleteDocument } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: params.id },
        { orderNumber: params.id }
      ]
    },
    include: {
      customer: true,
      shop: true,
      delivery: true,
      printSetting: true,
      payment: true,
      assignedPrinter: true
    }
  });

  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  // Calculate orders ahead in queue for this shop
  const ordersAhead = await prisma.order.count({
    where: {
      shopId: order.shopId,
      status: { in: ['QUEUED', 'ACCEPTED', 'PRINTING'] },
      createdAt: { lt: order.createdAt }
    }
  });

  return NextResponse.json({
    order,
    queueInfo: {
      ordersAhead,
      queuePosition: ordersAhead + 1,
      estimatedWaitMins: (ordersAhead + 1) * 3
    }
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  const payload = await request.json();

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: params.id }, { orderNumber: params.id }]
    },
    include: { delivery: true, shop: true }
  });

  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  // Permission check: Admin or Shop Owner of this shop
  const isAdmin = user?.role === 'ADMIN';
  const isShopOwner = user && user.role === 'SHOP_OWNER' && order.shop.ownerId === user.id;

  if (!isAdmin && !isShopOwner) {
    // If guest/customer requesting cancellation before acceptance
    if (payload.status === 'CANCELLED' && order.status === 'QUEUED') {
      // allow customer cancellation
    } else {
      return NextResponse.json({ error: 'Unauthorized to modify this order.' }, { status: 403 });
    }
  }

  const updates: any = {};
  let timeline = [];
  try {
    timeline = JSON.parse(order.statusTimeline as string);
  } catch (e) {
    timeline = [];
  }

  // 1. PIN Verification for Completion
  if (payload.status === 'COMPLETED') {
    if (!isAdmin && payload.pickupPin) {
      if (payload.pickupPin.trim() !== order.pickupPin) {
        return NextResponse.json(
          { error: 'Invalid 4-digit pickup PIN. Please check the customer PIN.' },
          { status: 400 }
        );
      }
    }

    updates.status = 'COMPLETED';
    updates.completedAt = new Date();
    timeline.push({ status: 'COMPLETED', time: new Date().toISOString() });

    // Multi-layer privacy deletion: Purge document immediately upon verified handover!
    if (order.storageKey || order.documentUrl) {
      await deleteDocument(order.storageKey || order.documentUrl);
      updates.documentUrl = '[DELETED_AFTER_PICKUP]';
    }
  }

  // 2. Acceptance
  else if (payload.status === 'ACCEPTED') {
    updates.status = 'ACCEPTED';
    timeline.push({ status: 'ACCEPTED', time: new Date().toISOString() });
  }

  // 3. Printing
  else if (payload.status === 'PRINTING') {
    updates.status = 'PRINTING';
    timeline.push({ status: 'PRINTING', time: new Date().toISOString() });
    if (payload.assignedPrinterId) {
      updates.assignedPrinterId = payload.assignedPrinterId;
    }
  }

  // 4. Ready for Pickup (Printing is complete -> permanently delete document from Supabase Storage for privacy)
  else if (payload.status === 'READY_FOR_PICKUP') {
    updates.status = 'READY_FOR_PICKUP';
    timeline.push({ status: 'READY_FOR_PICKUP', time: new Date().toISOString() });

    // Permanently purge document from Supabase storage once printed
    if (order.storageKey || (order.documentUrl && !order.documentUrl.startsWith('[DELETED'))) {
      await deleteDocument(order.storageKey || order.documentUrl);
      updates.documentUrl = '[DELETED_AFTER_PRINT]';
    }
  }

  // 5. Rejection / Cancellation
  else if (payload.status === 'REJECTED' || payload.status === 'CANCELLED') {
    updates.status = payload.status;
    updates.rejectedReason = payload.rejectedReason || 'Cancelled by operator';
    timeline.push({ status: payload.status, time: new Date().toISOString() });

    // Purge file on reject/cancel
    if (order.storageKey || order.documentUrl) {
      await deleteDocument(order.storageKey || order.documentUrl);
      updates.documentUrl = '[PURGED]';
    }
  }

  // Generic status fallback for admin
  else if (payload.status) {
    updates.status = payload.status;
    timeline.push({ status: payload.status, time: new Date().toISOString() });
  }

  updates.statusTimeline = JSON.stringify(timeline);

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: updates,
    include: { shop: true, printSetting: true, payment: true }
  });

  // Notify customer if customer account exists
  if (order.customerId) {
    await addNotification(
      order.customerId,
      `Your order ${order.orderNumber} status changed to ${updatedOrder.status}.`,
      'order'
    );
  }

  return NextResponse.json({ order: updatedOrder });
}

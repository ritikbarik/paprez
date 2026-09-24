import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, addNotification } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    const deliveries = await prisma.delivery.findMany({
      where: { status: 'OPEN', agentId: null },
      include: { order: { include: { customer: true, shop: true } } }
    });

    return NextResponse.json({ deliveries });
  }

  const where: any =
    user.role === 'SHOP_OWNER'
      ? { order: { shop: { ownerId: user.id } } }
      : user.role === 'DELIVERY_AGENT'
        ? { OR: [{ agentId: user.id }, { status: 'OPEN', agentId: null }] }
        : user.role === 'ADMIN'
          ? {}
          : { order: { customerId: user.id } };

  const deliveries = await prisma.delivery.findMany({
    where,
    include: { agent: true, order: { include: { customer: true, shop: true } } }
  });

  return NextResponse.json({ deliveries });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'DELIVERY_AGENT') {
    return NextResponse.json({ error: 'Delivery agent login is required.' }, { status: 401 });
  }

  const { deliveryId } = await request.json();
  if (!deliveryId) {
    return NextResponse.json({ error: 'Missing delivery ID.' }, { status: 400 });
  }

  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: { order: { include: { shop: true } } }
  });

  if (!delivery || delivery.status !== 'OPEN' || delivery.agentId) {
    return NextResponse.json({ error: 'Pickup request is no longer open.' }, { status: 409 });
  }

  const [, updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id: delivery.orderId },
      data: { deliveryAgentId: user.id }
    }),
    prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        agentId: user.id,
        status: 'PENDING_SHOP_APPROVAL'
      },
      include: { agent: true, order: { include: { customer: true, shop: true } } }
    })
  ]);

  await addNotification(
    delivery.order.shop.ownerId,
    `${user.name} requested pickup approval for ${delivery.order.title}.`,
    'delivery'
  );

  return NextResponse.json({ delivery: updated });
}

export async function PATCH(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || (user.role !== 'DELIVERY_AGENT' && user.role !== 'SHOP_OWNER')) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { deliveryId, status, otp, approved } = await request.json();
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: { order: { include: { shop: true } }, agent: true }
  });
  if (!delivery) {
    return NextResponse.json({ error: 'Delivery not found.' }, { status: 404 });
  }

  if (user.role === 'SHOP_OWNER') {
    if (delivery.order.shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const nextStatus = approved === false ? 'OPEN' : 'APPROVED_FOR_PICKUP';
    const [, updated] = await prisma.$transaction([
      prisma.order.update({
        where: { id: delivery.orderId },
        data: { deliveryAgentId: approved === false ? null : delivery.agentId }
      }),
      prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          status: nextStatus,
          agentId: approved === false ? null : delivery.agentId
        }
      })
    ]);

    if (delivery.agentId) {
      await addNotification(
        delivery.agentId,
        approved === false ? `Pickup request for ${delivery.order.title} was declined.` : `Pickup approved for ${delivery.order.title}.`,
        'delivery'
      );
    }

    return NextResponse.json({ delivery: updated });
  }

  if (delivery.agentId !== user.id) {
    return NextResponse.json({ error: 'Delivery not found.' }, { status: 404 });
  }

  const updates: any = {};
  if (status) updates.status = status;
  if (status === 'DELIVERED' && otp) {
    if (otp !== delivery.otpCode) {
      return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
    }
    updates.status = 'DELIVERED';
    updates.order = { update: { status: 'DELIVERED', completedAt: new Date() } };
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided.' }, { status: 400 });
  }

  const updated = await prisma.delivery.update({ where: { id: deliveryId }, data: updates });
  if (delivery.order.customerId) {
    await addNotification(delivery.order.customerId, `Delivery status updated to ${updated.status}.`, 'delivery');
  }
  return NextResponse.json({ delivery: updated });
}

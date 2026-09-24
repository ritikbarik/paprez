import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, addNotification } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  const isShopMode = request.headers.get('x-shop-mode') === 'true';
  const shopIdHeader = request.headers.get('x-shop-id');

  // If request comes from the shop operating terminal
  if (isShopMode && (!user || user.role === 'SHOP_OWNER')) {
    let targetShop = null;
    if (user && user.role === 'SHOP_OWNER') {
      targetShop = await prisma.shop.findUnique({ where: { ownerId: user.id } });
    }
    if (!targetShop && shopIdHeader) {
      targetShop = await prisma.shop.findUnique({ where: { id: shopIdHeader } });
    }
    if (!targetShop) {
      targetShop = await prisma.shop.findFirst({ where: { slug: 'abc-xerox' } });
    }

    if (targetShop) {
      const orders = await prisma.order.findMany({
        where: { shopId: targetShop.id },
        orderBy: { createdAt: 'desc' },
        include: { customer: true, shop: true, delivery: true, printSetting: true, payment: true }
      });
      return NextResponse.json({ orders, shop: targetShop });
    }
  }

  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  if (user.role === 'ADMIN') {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { customer: true, shop: true, delivery: true, printSetting: true, payment: true }
    });
    return NextResponse.json({ orders });
  }

  if (user.role === 'SHOP_OWNER') {
    const shop = await prisma.shop.findUnique({ where: { ownerId: user.id } });
    if (!shop) return NextResponse.json({ orders: [] });
    const orders = await prisma.order.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: 'desc' },
      include: { customer: true, shop: true, delivery: true, printSetting: true, payment: true }
    });
    return NextResponse.json({ orders, shop });
  }

  if (user.role === 'DELIVERY_AGENT') {
    const orders = await prisma.order.findMany({
      where: { deliveryAgentId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { customer: true, shop: true, delivery: true }
    });
    return NextResponse.json({ orders });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { shop: true, delivery: true, printSetting: true, payment: true }
  });
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    const data = await request.json();
    const {
      shopId,
      title,
      notes,
      pickupMethod = 'pickup',
      estimatedPrice,
      documentUrl,
      storageKey,
      pageCount = 1,
      urgency = false,
      printSetting,
      customerPhone,
      customerName
    } = data;

    if (!shopId || !title || !documentUrl) {
      return NextResponse.json({ error: 'Missing required order details.' }, { status: 400 });
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    });

    if (!shop) {
      return NextResponse.json({ error: 'Print shop not found.' }, { status: 404 });
    }

    if (!shop.active) {
      return NextResponse.json(
        { error: 'This shop is temporarily not accepting new orders. Please check back shortly.' },
        { status: 403 }
      );
    }

    // Generate Human-Readable Order Number (e.g. PAP-1024)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `PAP-${randomSuffix}`;

    // Generate 4-digit secure Pickup PIN
    const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();

    // Determine customer link or guest
    let customerId = user ? user.id : null;
    if (!customerId && customerPhone) {
      // Find or create customer by phone
      const phoneEmail = `${customerPhone.replace(/[^0-9]/g, '')}@guest.paprez.com`;
      const guestUser = await prisma.user.upsert({
        where: { email: phoneEmail },
        update: { phone: customerPhone, name: customerName || 'Guest Customer' },
        create: {
          email: phoneEmail,
          password: 'guest_no_password',
          name: customerName || 'Guest Customer',
          phone: customerPhone,
          role: 'CUSTOMER'
        }
      });
      customerId = guestUser.id;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        shopId,
        customerId,
        customerPhone: customerPhone || null,
        title,
        notes: notes || null,
        urgency,
        pickupMethod,
        pickupPin,
        estimatedPrice: Number(estimatedPrice) || 0,
        estimatedTime: urgency ? '~5-10 mins' : '~15-30 mins',
        pageCount: Number(pageCount) || 1,
        documentUrl,
        storageKey: storageKey || null,
        status: 'QUEUED',
        statusTimeline: JSON.stringify([
          { status: 'PAYMENT_PENDING', time: new Date().toISOString() },
          { status: 'QUEUED', time: new Date().toISOString() }
        ]),
        printSetting: {
          create: {
            color: printSetting?.color ?? false,
            doubleSided: printSetting?.doubleSided ?? false,
            copies: Number(printSetting?.copies) || 1,
            pageRange: printSetting?.pageRange || 'all',
            paperSize: printSetting?.paperSize || 'A4',
            binding: printSetting?.binding || 'none'
          }
        },
        payment: {
          create: {
            amount: Number(estimatedPrice) || 0,
            status: 'PAID',
            provider: 'razorpay',
            transaction: `pay_upi_${Date.now()}`
          }
        }
      },
      include: {
        shop: true,
        printSetting: true,
        payment: true
      }
    });

    // Notify shop owner
    await addNotification(
      shop.ownerId,
      `New print order ${order.orderNumber} received for ${order.title}.`,
      'order'
    );

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order.' }, { status: 500 });
  }
}

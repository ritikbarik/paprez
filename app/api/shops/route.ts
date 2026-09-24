import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/utils';

export async function GET() {
  const shops = await prisma.shop.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true } },
      printers: true
    }
  });
  return NextResponse.json({ shops });
}

export async function PATCH(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || (user.role !== 'SHOP_OWNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      shopId,
      name,
      address,
      city,
      phone,
      latitude,
      longitude,
      operatingHours,
      services,
      pricingRules,
      active
    } = body;

    // Find shop owned by this user (or by shopId if admin)
    const shop = await prisma.shop.findFirst({
      where: user.role === 'ADMIN' && shopId ? { id: shopId } : { ownerId: user.id }
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (address) updates.address = address;
    if (city) updates.city = city;
    if (phone) updates.phone = phone;
    if (typeof latitude === 'number') updates.latitude = latitude;
    if (typeof longitude === 'number') updates.longitude = longitude;
    if (operatingHours) updates.operatingHours = operatingHours;
    if (typeof active === 'boolean') updates.active = active;
    if (services) {
      updates.services = typeof services === 'string' ? services : JSON.stringify(services);
    }
    if (pricingRules) {
      updates.pricingRules = typeof pricingRules === 'string' ? pricingRules : JSON.stringify(pricingRules);
    }

    const updated = await prisma.shop.update({
      where: { id: shop.id },
      data: updates,
      include: { printers: true }
    });

    return NextResponse.json({ shop: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update shop profile.' }, { status: 500 });
  }
}

// Add a new printer to the shop
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'SHOP_OWNER') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const shop = await prisma.shop.findUnique({
      where: { ownerId: user.id }
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });
    }

    const { name, model, capabilities, status = 'ONLINE' } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Printer name is required.' }, { status: 400 });
    }

    const printer = await prisma.printer.create({
      data: {
        shopId: shop.id,
        name,
        model: model || 'Commercial Multi-Function Spooler',
        capabilities: typeof capabilities === 'string' ? capabilities : JSON.stringify(capabilities || { color: false, duplex: true, sizes: ['A4'] }),
        status
      }
    });

    return NextResponse.json({ printer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add printer.' }, { status: 500 });
  }
}

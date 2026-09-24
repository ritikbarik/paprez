import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createToken, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role = 'CUSTOMER',
      // Shop owner specific fields
      shopName,
      shopSlug,
      shopAddress,
      shopCity,
      shopPhone,
      latitude,
      longitude,
      operatingHours,
      services,
      pricingRules,
      printerName,
      printerModel,
      printerCapabilities
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const normalizedRole = role.toUpperCase();
    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: normalizedRole
      }
    });

    // If registering as SHOP_OWNER, create the associated Shop and Printer records
    if (normalizedRole === 'SHOP_OWNER') {
      const generatedSlug = (shopSlug || shopName || `shop-${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

      const shop = await prisma.shop.create({
        data: {
          name: shopName || `${name}'s Print Hub`,
          slug: generatedSlug,
          ownerId: user.id,
          address: shopAddress || 'Main Market Road',
          city: shopCity || 'Bhubaneswar',
          phone: shopPhone || '+91 98765 00000',
          latitude: Number(latitude) || 20.2961,
          longitude: Number(longitude) || 85.8245,
          operatingHours: operatingHours || '8:00 AM - 10:00 PM',
          services: typeof services === 'string' ? services : JSON.stringify(services || [
            'B&W Printing',
            'Color Printing',
            'Duplex Printing',
            'Spiral Binding',
            'Staple Binding',
            'Lamination',
            'Rush Priority'
          ]),
          pricingRules: typeof pricingRules === 'string' ? pricingRules : JSON.stringify(pricingRules || {
            bwSingle: 2,
            bwDuplex: 3,
            colorSingle: 10,
            colorDuplex: 18,
            spiralBinding: 30,
            stapleBinding: 10,
            lamination: 20,
            rushFee: 20
          }),
          active: true
        }
      });

      // Create primary printer if provided
      if (printerName) {
        await prisma.printer.create({
          data: {
            shopId: shop.id,
            name: printerName,
            model: printerModel || 'Multi-Function Network Printer',
            capabilities: typeof printerCapabilities === 'string' 
              ? printerCapabilities 
              : JSON.stringify(printerCapabilities || { color: true, duplex: true, sizes: ['A4', 'Legal'] }),
            status: 'ONLINE'
          }
        });
      }
    }

    const token = createToken({ userId: user.id, role: user.role });
    return NextResponse.json(
      {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed.' }, { status: 500 });
  }
}

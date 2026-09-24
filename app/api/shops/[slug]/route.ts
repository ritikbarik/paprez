import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const shop = await prisma.shop.findUnique({
      where: { slug },
      include: {
        printers: true,
        _count: {
          select: {
            orders: {
              where: {
                status: {
                  in: ['QUEUED', 'ACCEPTED', 'PRINTING']
                }
              }
            }
          }
        }
      }
    });

    if (!shop) {
      return NextResponse.json({ error: 'Print shop not found.' }, { status: 404 });
    }

    let parsedPricing = {
      bwSingle: 2,
      bwDuplex: 3,
      colorSingle: 10,
      colorDuplex: 18,
      spiralBinding: 30,
      stapleBinding: 10,
      lamination: 20,
      rushFee: 20
    };

    if (shop.pricingRules) {
      try {
        parsedPricing = { ...parsedPricing, ...JSON.parse(shop.pricingRules) };
      } catch (e) {
        // fallback
      }
    }

    let parsedServices: string[] = [
      'B&W Laser Printing',
      'Color Printing',
      'Auto Duplex',
      'Spiral Binding',
      'Staple Binding',
      'Lamination',
      'Rush Priority'
    ];

    if (shop.services) {
      try {
        parsedServices = JSON.parse(shop.services);
      } catch (e) {
        // fallback
      }
    }

    return NextResponse.json({
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        address: shop.address,
        city: shop.city,
        phone: shop.phone,
        active: shop.active,
        latitude: shop.latitude,
        longitude: shop.longitude,
        operatingHours: shop.operatingHours,
        services: parsedServices,
        queueCount: shop._count.orders,
        pricing: parsedPricing,
        printers: shop.printers.map((p) => {
          let caps = { color: false, duplex: true, sizes: ['A4'] };
          try {
            caps = JSON.parse(p.capabilities);
          } catch (e) {}
          return {
            id: p.id,
            name: p.name,
            model: p.model,
            status: p.status,
            capabilities: caps
          };
        }),
        printersCount: shop.printers.length
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error loading shop.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      shopId,
      pageCount = 1,
      color = false,
      doubleSided = false,
      copies = 1,
      binding = 'none',
      isRush = false
    } = body;

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required for calculation.' }, { status: 400 });
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });
    }

    let pricing = {
      bwSingle: 2,
      bwDuplex: 3,
      colorSingle: 10,
      colorDuplex: 18,
      spiralBinding: 30,
      stapleBinding: 10,
      rushFee: 20
    };

    if (shop.pricingRules) {
      try {
        pricing = { ...pricing, ...JSON.parse(shop.pricingRules) };
      } catch (e) {
        // fallback
      }
    }

    const pages = Math.max(1, Number(pageCount) || 1);
    const numCopies = Math.max(1, Number(copies) || 1);

    // Rate per sheet/page based on color and duplex
    let ratePerPage = 2;
    if (color) {
      ratePerPage = doubleSided ? pricing.colorDuplex / 2 : pricing.colorSingle;
    } else {
      ratePerPage = doubleSided ? pricing.bwDuplex / 2 : pricing.bwSingle;
    }

    const printSubtotal = Number((pages * ratePerPage * numCopies).toFixed(2));

    let bindingCost = 0;
    if (binding === 'spiral') bindingCost = pricing.spiralBinding * numCopies;
    if (binding === 'stapled') bindingCost = pricing.stapleBinding * numCopies;

    const rushCost = isRush ? pricing.rushFee : 0;
    const shopSubtotal = Number((printSubtotal + bindingCost + rushCost).toFixed(2));

    // Platform commission to website: ₹0.20 per page paid by the user
    const platformFeeRate = 0.20;
    const platformFee = Number((pages * numCopies * platformFeeRate).toFixed(2));

    const total = Number((shopSubtotal + platformFee).toFixed(2));

    return NextResponse.json({
      calculation: {
        pageCount: pages,
        copies: numCopies,
        color,
        doubleSided,
        binding,
        isRush,
        ratePerPage,
        printSubtotal,
        bindingCost,
        rushCost,
        shopSubtotal,
        platformFeeRate,
        platformFee,
        total
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Price calculation failed.' }, { status: 500 });
  }
}

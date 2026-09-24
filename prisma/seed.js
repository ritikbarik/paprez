const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('DemoPass123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@paprez.com' },
    update: {},
    create: {
      name: 'PAPrez Admin',
      email: 'admin@paprez.com',
      password,
      role: 'ADMIN'
    }
  });

  const owner1 = await prisma.user.upsert({
    where: { email: 'owner@paprez.com' },
    update: {},
    create: {
      name: 'Ramesh Sharma',
      email: 'owner@paprez.com',
      password,
      role: 'SHOP_OWNER'
    }
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'campus@paprez.com' },
    update: {},
    create: {
      name: 'Vikram Patel',
      email: 'campus@paprez.com',
      password,
      role: 'SHOP_OWNER'
    }
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@paprez.com' },
    update: {},
    create: {
      name: 'Ananya Verma',
      email: 'customer@paprez.com',
      password,
      role: 'CUSTOMER'
    }
  });

  const shop1 = await prisma.shop.upsert({
    where: { ownerId: owner1.id },
    update: {
      slug: 'abc-xerox',
      active: true,
      latitude: 20.2961,
      longitude: 85.8245,
      operatingHours: '8:00 AM - 10:00 PM',
      services: JSON.stringify([
        'B&W Laser Printing',
        'Full Color Printing',
        'Auto Duplex',
        'Spiral Binding',
        'Staple Binding',
        'Lamination',
        'Project Reports',
        'Rush Priority'
      ]),
      pricingRules: JSON.stringify({
        bwSingle: 2,
        bwDuplex: 3,
        colorSingle: 10,
        colorDuplex: 18,
        spiralBinding: 30,
        stapleBinding: 10,
        lamination: 20,
        rushFee: 20
      })
    },
    create: {
      name: 'ABC Xerox & Digital Printing',
      slug: 'abc-xerox',
      ownerId: owner1.id,
      city: 'Bhubaneswar',
      address: 'Shop 4, University Gate Road',
      phone: '+91 98765 43210',
      latitude: 20.2961,
      longitude: 85.8245,
      operatingHours: '8:00 AM - 10:00 PM',
      services: JSON.stringify([
        'B&W Laser Printing',
        'Full Color Printing',
        'Auto Duplex',
        'Spiral Binding',
        'Staple Binding',
        'Lamination',
        'Project Reports',
        'Rush Priority'
      ]),
      feePercentage: 10,
      active: true,
      pricingRules: JSON.stringify({
        bwSingle: 2,
        bwDuplex: 3,
        colorSingle: 10,
        colorDuplex: 18,
        spiralBinding: 30,
        stapleBinding: 10,
        lamination: 20,
        rushFee: 20
      })
    }
  });

  const shop2 = await prisma.shop.upsert({
    where: { ownerId: owner2.id },
    update: {
      slug: 'campus-prints',
      active: true,
      latitude: 20.3015,
      longitude: 85.8312,
      operatingHours: '7:30 AM - 11:00 PM',
      services: JSON.stringify([
        'B&W Fast Photocopy',
        'Full Color Printing',
        'A3 Wide-Format',
        'Softcover Binding',
        'Spiral Binding',
        'Stapling',
        'Express Print'
      ]),
      pricingRules: JSON.stringify({
        bwSingle: 1.5,
        bwDuplex: 2.5,
        colorSingle: 8,
        colorDuplex: 15,
        spiralBinding: 25,
        stapleBinding: 5,
        lamination: 15,
        rushFee: 15
      })
    },
    create: {
      name: 'Campus QuickPrint Center',
      slug: 'campus-prints',
      ownerId: owner2.id,
      city: 'Bhubaneswar',
      address: 'Opposite Library Block, Student Hub',
      phone: '+91 98765 12345',
      latitude: 20.3015,
      longitude: 85.8312,
      operatingHours: '7:30 AM - 11:00 PM',
      services: JSON.stringify([
        'B&W Fast Photocopy',
        'Full Color Printing',
        'A3 Wide-Format',
        'Softcover Binding',
        'Spiral Binding',
        'Stapling',
        'Express Print'
      ]),
      feePercentage: 10,
      active: true,
      pricingRules: JSON.stringify({
        bwSingle: 1.5,
        bwDuplex: 2.5,
        colorSingle: 8,
        colorDuplex: 15,
        spiralBinding: 25,
        stapleBinding: 5,
        lamination: 15,
        rushFee: 15
      })
    }
  });

  // Create Printers for Shop 1
  await prisma.printer.deleteMany({ where: { shopId: shop1.id } });
  await prisma.printer.createMany({
    data: [
      {
        shopId: shop1.id,
        name: 'HP LaserJet Enterprise M608dn',
        model: 'LaserJet B&W Duplex',
        capabilities: JSON.stringify({ color: false, duplex: true, sizes: ['A4', 'Legal'] }),
        status: 'ONLINE'
      },
      {
        shopId: shop1.id,
        name: 'Canon imageRUNNER ADVANCE C3530i',
        model: 'Heavy-duty Color MFP',
        capabilities: JSON.stringify({ color: true, duplex: true, sizes: ['A4', 'A3'] }),
        status: 'ONLINE'
      }
    ]
  });

  // Create Print Agent for Shop 1
  await prisma.printAgent.deleteMany({ where: { shopId: shop1.id } });
  await prisma.printAgent.create({
    data: {
      shopId: shop1.id,
      agentName: 'Counter Station 1 (Windows 11)',
      status: 'ONLINE',
      tokenHash: 'agent_tok_demo_abc_001'
    }
  });

  // Seed sample orders
  const existingOrders = await prisma.order.findMany({ where: { shopId: shop1.id } });
  if (existingOrders.length === 0) {
    await prisma.order.create({
      data: {
        orderNumber: 'PAP-1024',
        title: 'Project Report Final Submission.pdf',
        customerId: customer.id,
        shopId: shop1.id,
        notes: 'Please staple on top-left corner.',
        urgency: true,
        pickupMethod: 'pickup',
        pickupPin: '4827',
        estimatedPrice: 42.0,
        estimatedTime: '~7 mins',
        pageCount: 14,
        documentUrl: '/uploads/sample_report.pdf',
        status: 'QUEUED',
        statusTimeline: JSON.stringify([
          { status: 'PAYMENT_PENDING', time: new Date().toISOString() },
          { status: 'QUEUED', time: new Date().toISOString() }
        ]),
        printSetting: {
          create: {
            color: false,
            doubleSided: true,
            copies: 1,
            pageRange: 'all',
            paperSize: 'A4',
            binding: 'stapled'
          }
        },
        payment: {
          create: {
            amount: 42.0,
            status: 'PAID',
            provider: 'razorpay',
            transaction: 'pay_demo_upi_001'
          }
        }
      }
    });

    await prisma.order.create({
      data: {
        orderNumber: 'PAP-1025',
        title: 'Placement Resume 2026.pdf',
        customerId: customer.id,
        shopId: shop1.id,
        notes: 'Glossy paper if available.',
        urgency: false,
        pickupMethod: 'pickup',
        pickupPin: '7912',
        estimatedPrice: 30.0,
        estimatedTime: '~12 mins',
        pageCount: 3,
        documentUrl: '/uploads/sample_resume.pdf',
        status: 'PRINTING',
        statusTimeline: JSON.stringify([
          { status: 'PAYMENT_PENDING', time: new Date().toISOString() },
          { status: 'QUEUED', time: new Date().toISOString() },
          { status: 'ACCEPTED', time: new Date().toISOString() },
          { status: 'PRINTING', time: new Date().toISOString() }
        ]),
        printSetting: {
          create: {
            color: true,
            doubleSided: false,
            copies: 3,
            pageRange: 'all',
            paperSize: 'A4',
            binding: 'none'
          }
        },
        payment: {
          create: {
            amount: 30.0,
            status: 'PAID',
            provider: 'razorpay',
            transaction: 'pay_demo_upi_002'
          }
        }
      }
    });
  }

  console.log('Seeded successfully with realistic shops, printers, and queue orders:');
  console.log(`- Shop 1: http://localhost:3000/shop/${shop1.slug}`);
  console.log(`- Shop 2: http://localhost:3000/shop/${shop2.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

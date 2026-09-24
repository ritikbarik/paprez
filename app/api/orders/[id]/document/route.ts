import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabaseAdmin, BUCKET_NAME } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }]
      }
    });

    if (!order) {
      return new NextResponse('Order not found.', { status: 404 });
    }

    if (
      !order.documentUrl ||
      order.documentUrl.startsWith('[DELETED') ||
      order.documentUrl.startsWith('[PURGED')
    ) {
      return new NextResponse(
        'Document has been permanently purged from servers following print pickup to protect customer privacy.',
        { status: 410 }
      );
    }

    let key = (order.storageKey || '').trim();
    if (!key && order.documentUrl) {
      if (order.documentUrl.includes('key=')) {
        try {
          const u = new URL(order.documentUrl, 'http://localhost');
          key = u.searchParams.get('key') || '';
        } catch (e) {}
      } else if (order.documentUrl.includes('/paprez-documents/')) {
        key = order.documentUrl.split('/paprez-documents/')[1]?.split('?')[0] || '';
      } else if (order.documentUrl.includes('orders/')) {
        const idx = order.documentUrl.indexOf('orders/');
        key = order.documentUrl.substring(idx).split('?')[0];
      }
    }

    // 1. If stored in Supabase
    if (supabaseAdmin && (key.startsWith('orders/') || key.length > 0 && !key.startsWith('local:'))) {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .download(key);

      if (error || !data) {
        return new NextResponse(
          'Document has been deleted from cloud server.',
          { status: 404 }
        );
      }

      const buffer = Buffer.from(await data.arrayBuffer());
      const ext = path.extname(key).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (ext === '.doc') contentType = 'application/msword';
      else if (ext === '.txt') contentType = 'text/plain; charset=utf-8';

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${order.title || 'document'}"`,
          'Cache-Control': 'private, no-cache, no-store'
        }
      });
    }

    // 2. If stored locally
    const localName = key.startsWith('local:') ? key.replace('local:', '') : path.basename(order.documentUrl.split('?')[0]);
    const localPath = path.join(process.cwd(), 'public', 'uploads', localName);

    if (fs.existsSync(localPath)) {
      const buffer = fs.readFileSync(localPath);
      const ext = path.extname(localName).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.txt') contentType = 'text/plain; charset=utf-8';

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${order.title || 'document'}"`,
          'Cache-Control': 'private, no-cache, no-store'
        }
      });
    }

    return new NextResponse('Document not found.', { status: 404 });
  } catch (error: any) {
    console.error('Order document stream error:', error);
    return new NextResponse('Failed to load document.', { status: 500 });
  }
}

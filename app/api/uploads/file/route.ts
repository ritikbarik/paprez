import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, BUCKET_NAME } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawKey = searchParams.get('key') || '';
    const key = decodeURIComponent(rawKey).trim();

    if (!key) {
      return new NextResponse('File key is required.', { status: 400 });
    }

    // Determine MIME type from extension
    const ext = path.extname(key.split('?')[0]).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (ext === '.doc') contentType = 'application/msword';
    else if (ext === '.txt') contentType = 'text/plain; charset=utf-8';

    const fileName = path.basename(key.split('?')[0]) || 'document.pdf';

    // 1. Check if file is stored in Supabase Storage
    if (supabaseAdmin && (key.startsWith('orders/') || (!key.startsWith('local:') && !key.startsWith('/')))) {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .download(key);

      if (error || !data) {
        return new NextResponse(
          'Document is unavailable or has been permanently purged after printing to ensure privacy.',
          { status: 404 }
        );
      }

      const buffer = Buffer.from(await data.arrayBuffer());

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${fileName}"`,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate'
        }
      });
    }

    // 2. Local filesystem storage fallback
    const localName = key.startsWith('local:') ? key.replace('local:', '') : path.basename(key.split('?')[0]);
    const localPath = path.join(process.cwd(), 'public', 'uploads', localName);

    if (fs.existsSync(localPath)) {
      const fileBuffer = fs.readFileSync(localPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${fileName}"`,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate'
        }
      });
    }

    return new NextResponse(
      'Document not found or has been purged following verified print pickup.',
      { status: 404 }
    );
  } catch (error: any) {
    console.error('File stream error:', error);
    return new NextResponse('Failed to retrieve document stream.', { status: 500 });
  }
}

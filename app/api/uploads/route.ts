import path from 'path';
import { uploadDocument } from '@/lib/supabase';

// Quick heuristic for counting pages in a PDF buffer without heavy binary dependencies
function estimatePdfPageCount(buffer: Buffer): number {
  const content = buffer.toString('latin1');
  const pageMatches = content.match(/\/Type\s*\/Page\b/g);
  if (pageMatches && pageMatches.length > 0) {
    return pageMatches.length;
  }
  // Fallback by file size: ~35KB per typical document page
  return Math.max(1, Math.ceil(buffer.length / (35 * 1024)));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contentBase64 } = body;

    if (!name || !contentBase64) {
      return new Response(JSON.stringify({ error: 'Invalid upload payload.' }), { status: 400 });
    }

    const extension = path.extname(name).toLowerCase();
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.pptx', '.txt', '.png', '.jpg', '.jpeg'];
    if (!allowedExtensions.includes(extension)) {
      return new Response(
        JSON.stringify({ error: 'Supported formats: PDF, DOC, DOCX, PPTX, TXT, PNG, JPG.' }),
        { status: 400 }
      );
    }

    const maxBytes = Number(process.env.UPLOAD_MAX_BYTES || 25 * 1024 * 1024); // 25MB default
    const buffer = Buffer.from(contentBase64, 'base64');
    if (buffer.byteLength > maxBytes) {
      return new Response(
        JSON.stringify({ error: `Upload must be ${Math.round(maxBytes / 1024 / 1024)}MB or smaller.` }),
        { status: 413 }
      );
    }

    let mimeType = 'application/octet-stream';
    if (extension === '.pdf') mimeType = 'application/pdf';
    else if (extension === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (extension === '.doc') mimeType = 'application/msword';
    else if (extension === '.pptx') mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    else if (extension === '.txt') mimeType = 'text/plain';
    else if (extension === '.png') mimeType = 'image/png';
    else if (extension === '.jpg' || extension === '.jpeg') mimeType = 'image/jpeg';

    // Calculate detected page count
    let pageCount = 1;
    if (extension === '.pdf') {
      pageCount = estimatePdfPageCount(buffer);
    } else if (extension === '.png' || extension === '.jpg' || extension === '.jpeg') {
      pageCount = 1;
    } else {
      // Approximate for text and office docs
      pageCount = Math.max(1, Math.ceil(buffer.length / (40 * 1024)));
    }

    // Upload to Supabase Storage with local fallback
    const { url, key, isCloud } = await uploadDocument(buffer, name, mimeType);

    return new Response(
      JSON.stringify({
        url,
        storageKey: key,
        bytes: buffer.byteLength,
        pageCount,
        isCloud,
        fileName: name
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process document upload.' }),
      { status: 500 }
    );
  }
}

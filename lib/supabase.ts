import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'print-uploads';

// Public Supabase client for client-side queries
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Admin Supabase client with service role key for storage and administrative actions
// (falls back to anon key if service role key is not yet configured)
export const supabaseAdmin = supabaseUrl && (supabaseServiceKey || supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey) 
  : null;

/**
 * Upload a document to Supabase Storage with local filesystem fallback for development
 */
export async function uploadDocument(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; key: string; isCloud: boolean }> {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const storagePath = `orders/${Date.now()}-${sanitizedName}`;

  if (supabaseAdmin) {
    try {
      let uploadRes = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType,
          upsert: true
        });

      // If bucket does not exist, auto-create it and retry
      if (uploadRes.error && (uploadRes.error.message?.toLowerCase().includes('not found') || (uploadRes.error as any).statusCode === '404')) {
        try {
          await supabaseAdmin.storage.createBucket(BUCKET_NAME, { public: true });
          uploadRes = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(storagePath, fileBuffer, {
              contentType,
              upsert: true
            });
        } catch (bucketErr) {
          console.warn('Auto-create bucket failed:', bucketErr);
        }
      }

      if (!uploadRes.error && uploadRes.data) {
        // Return masked proxy URL so the raw Supabase project URL is NEVER exposed to users or browser
        const fileUrl = `/api/uploads/file?key=${encodeURIComponent(storagePath)}`;
        return { url: fileUrl, key: storagePath, isCloud: true };
      } else if (uploadRes.error) {
        console.warn('Supabase upload error:', uploadRes.error.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, using local storage fallback:', err);
    }
  }

  // Local storage fallback
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFileName = `${Date.now()}-${sanitizedName}`;
  const localFilePath = path.join(uploadsDir, localFileName);
  fs.writeFileSync(localFilePath, fileBuffer);

  return {
    url: `/uploads/${localFileName}`,
    key: `local:${localFileName}`,
    isCloud: false
  };
}

/**
 * Permanently delete a document from Supabase Storage and local disk upon order completion
 */
export async function deleteDocument(storageKeyOrUrl: string): Promise<boolean> {
  if (!storageKeyOrUrl) return false;

  try {
    // 1. Check if Supabase key
    if (supabaseAdmin && storageKeyOrUrl.startsWith('orders/')) {
      await supabaseAdmin.storage.from(BUCKET_NAME).remove([storageKeyOrUrl]);
      return true;
    }

    // 2. Check if local fallback
    const localName = storageKeyOrUrl.startsWith('local:') 
      ? storageKeyOrUrl.replace('local:', '') 
      : path.basename(storageKeyOrUrl.split('?')[0]);

    const localPath = path.join(process.cwd(), 'public', 'uploads', localName);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }

    // Also attempt Supabase removal if URL matches
    if (supabaseAdmin) {
      const urlParts = storageKeyOrUrl.split(BUCKET_NAME + '/');
      if (urlParts.length > 1) {
        const key = decodeURIComponent(urlParts[1].split('?')[0]);
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([key]);
        return true;
      }
    }
  } catch (err) {
    console.error('Failed to purge document:', err);
  }

  return false;
}

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

declare global {
  var prisma: PrismaClient | undefined;
}

function getPrismaClient(): PrismaClient {
  const isVercel = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const dbUrl = process.env.DATABASE_URL || '';

  // If running in Vercel serverless environment with SQLite
  if (isVercel && (!dbUrl || dbUrl.startsWith('file:'))) {
    const tmpDbPath = path.join('/tmp', 'dev.db');

    if (!fs.existsSync(tmpDbPath)) {
      const possibleSources = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.resolve(process.cwd(), '..', 'prisma', 'dev.db'),
        path.resolve(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
        path.resolve(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.resolve(__dirname, '..', 'prisma', 'dev.db'),
        path.resolve('/var/task/prisma/dev.db'),
      ];

      for (const src of possibleSources) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            break;
          } catch (err) {
            console.warn(`Could not copy ${src} to ${tmpDbPath}:`, err);
          }
        }
      }
    }

    return new PrismaClient({
      datasources: {
        db: {
          url: `file:${tmpDbPath}`,
        },
      },
    });
  }

  // Standard development or external PostgreSQL
  return new PrismaClient();
}

export const prisma = global.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;


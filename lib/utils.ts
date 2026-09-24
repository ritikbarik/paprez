import { prisma } from './db';
import { verifyToken } from './auth';

export async function getUserFromRequest(req: Request) {
  let token: string | null = null;

  // 1. Check Authorization Bearer header
  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) {
    token = auth.slice(7);
  }

  // 2. Check Cookie header fallback
  if (!token) {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/paprez_token=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) return null;

  const payload = verifyToken(token) as { userId?: string } | null;
  if (!payload?.userId) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId }
  });
}

export async function addNotification(userId: string, message: string, category = 'system') {
  return prisma.notification.create({
    data: {
      userId,
      message,
      category
    }
  });
}

import { prisma } from './db';
import { verifyToken } from './auth';

export async function getUserFromRequest(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
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

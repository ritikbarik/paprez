import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}

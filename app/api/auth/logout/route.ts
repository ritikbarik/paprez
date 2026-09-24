import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout completed.' });
  response.cookies.set('paprez_token', '', {
    maxAge: 0,
    path: '/'
  });
  return response;
}

import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path === '/') {
    return NextResponse.next();
  }

  const session = await getToken({ req });
  if (!session && path === '/protected') {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  } else if (session && (path === '/auth/signin' || path === '/auth/signup')) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

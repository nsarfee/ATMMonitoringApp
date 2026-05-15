import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'bop_session';
const SESSION_VALUE  = 'authenticated';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the login page and Next.js internals
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (session !== SESSION_VALUE) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

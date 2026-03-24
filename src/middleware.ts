import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
  const { pathname } = request.nextUrl;

  // Daftar halaman auth
  const isAuthPage = pathname === '/auth/login' || pathname === '/register';
  // Daftar rute dashboard/internal
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/journal') ||
    pathname.startsWith('/breathe') ||
    pathname.startsWith('/mood') ||
    pathname.startsWith('/analytics');

  // 1. Jika sudah login tapi mau ke landing/login/register -> lempar ke dashboard
  if (isAuthenticated && (isAuthPage || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Jika belum login tapi mau ke halaman internal -> lempar ke login
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
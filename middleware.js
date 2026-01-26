import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Ambil token dan role dari cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // Public routes yang bisa diakses tanpa login
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Admin-only routes
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // User-only routes (admin tidak bisa akses ini)
  const userRoutes = ['/home', '/dashboard', '/evaluate', '/history'];
  const isUserRoute = userRoutes.some(route => pathname.startsWith(route));

  // Root redirect
  if (pathname === '/') {
    if (token && role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (token && role === 'user') {
      return NextResponse.redirect(new URL('/home', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Jika user sudah login dan mencoba akses login/register
  if (token && isPublicRoute) {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // Jika belum login dan mencoba akses protected routes
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  if (token) {
    // Admin mencoba akses user-only routes (redirect ke admin)
    if (role === 'admin' && isUserRoute) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // User mencoba akses admin-only routes (redirect ke home)
    if (role === 'user' && isAdminRoute) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    
    // Shared routes allowed for both admin and user
    // No redirect needed for shared routes
  }

  return NextResponse.next();
}

// Updated config for Next.js 16
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internals)
     * - static files (.*, .ico, .png, .jpg, .svg, .css, .js)
     */
    '/((?!api|_next|.*\\..*|favicon.ico).*)',
  ],
};
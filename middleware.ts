// middleware.ts

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- THIS IS THE FIX ---
  // Allow all requests to the landing page and public verification pages to pass through
  if (pathname === '/' || pathname.startsWith('/verify')) {
    return NextResponse.next();
  }

  // Define public paths that do not require authentication
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

  // Check if the current path is one of the public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // For all other paths, check for a valid session token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If no token, redirect to the login page
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is authenticated, check for role-based access for admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  // @ts-ignore
  const userRole = token.role as string;

  if (isAdminRoute && !['ADMIN', 'HR'].includes(userRole)) {
     const url = req.nextUrl.clone();
     url.pathname = '/dashboard'; // Or an 'access-denied' page
     return NextResponse.redirect(url);
  }

  // If all checks pass, allow the request to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
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


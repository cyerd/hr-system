// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow access to the landing page for everyone, bypassing all other checks
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Define public paths that do not require authentication
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify', // The base path for verification
  ];

  // Define admin/HR-only paths
  const adminPaths = [
    '/admin',
  ];

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

  // If user is not authenticated
  if (!token) {
    // If the path is not public, redirect to login
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // Allow access to public paths
    return NextResponse.next();
  }

  // If user is authenticated
  const userRole = token.role as string;

  // If an authenticated user tries to access a public path (like login), redirect them to the dashboard
  if (isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // If a non-admin/HR user tries to access an admin path, redirect them
  if (isAdminPath && !['ADMIN', 'HR'].includes(userRole)) {
    // You can redirect to a dedicated 'access-denied' page or the main dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
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


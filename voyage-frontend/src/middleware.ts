import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Allow access to auth pages when not authenticated
    if (pathname.startsWith('/auth/') && !token) {
      return NextResponse.next();
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/auth/') && token) {
      const redirectUrl = token.userType === 'travel_agent' 
        ? '/dashboard/travel-agent' 
        : '/dashboard/dmc-agent';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard/')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      
      // Check if user is accessing the correct dashboard
      const isTravel = pathname.startsWith('/dashboard/travel-agent');
      const isDMC = pathname.startsWith('/dashboard/dmc-agent');
      
      if (isTravel && token.userType !== 'travel_agent') {
        return NextResponse.redirect(new URL('/dashboard/dmc-agent', req.url));
      }
      
      if (isDMC && token.userType !== 'dmc_agent') {
        return NextResponse.redirect(new URL('/dashboard/travel-agent', req.url));
      }
    }

    // Protect other routes that require authentication
    const protectedRoutes = [
      '/profile',
      '/settings',
      '/hotels',
      '/offers',
      '/bookings',
      '/messages',
      '/search',
      '/incoming-offers',
      '/hotel-bookings',
    ];

    if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // This callback runs before the middleware function
        // Return true to allow the middleware to run, false to redirect to login
        const { pathname } = req.nextUrl;
        
        // Always allow access to auth pages
        if (pathname.startsWith('/auth/')) return true;
        
        // Allow access to public pages
        const publicRoutes = ['/', '/browse-dmcs', '/how-it-works', '/pricing', '/contact', '/help'];
        if (publicRoutes.includes(pathname)) return true;
        
        // For all other routes, require authentication
        return !!token;
      },
    },
  }
);

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
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * Runs before any route is processed
 * 
 * @param request The incoming request
 */
export function middleware(request: NextRequest) {
  // Create a new response or clone the incoming one
  const response = NextResponse.next();

  // Add custom headers for development environment
  response.headers.set('x-typing-garden', 'dev');
  response.headers.set('x-request-time', new Date().toISOString());

  // You can also analyze the request path
  const pathname = request.nextUrl.pathname;
  
  // Add API-specific headers
  if (pathname.startsWith('/api/')) {
    response.headers.set('x-api-environment', process.env.NODE_ENV || 'development');
    
    // Example: Add timing information for API requests
    const startTime = Date.now();
    response.headers.set('x-request-start', startTime.toString());
  }

  return response;
}

/**
 * Configure which routes trigger the middleware
 * Here we match:
 * - API routes (/api/*)
 * - Main app routes (/)
 */
export const config = {
  matcher: [
    '/api/:path*',
    '/'
  ]
};
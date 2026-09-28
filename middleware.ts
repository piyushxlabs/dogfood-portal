// middleware.ts
// Lightweight Next.js App Router middleware for header normalization and request pass-through
// Authoritative security and DB role resolution executes in Node.js Route Handlers (lib/auth.ts)

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Attach request path for RSC layout context if needed
  response.headers.set('x-pathname', request.nextUrl.pathname);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

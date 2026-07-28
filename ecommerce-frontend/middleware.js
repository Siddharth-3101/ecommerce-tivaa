import { NextResponse } from 'next/server';

export function middleware(request) {
  const host = request.headers.get('host');
  const pathname = request.nextUrl.pathname;
  
  // 1. Exclude static files, Next.js internal files, and API routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // matches favicon.ico, sitemap.xml, robots.txt, images, etc.
  ) {
    return NextResponse.next();
  }
  
  // 2. Normalize host (lowercase and strip port numbers if present)
  const cleanHost = (host || '').toLowerCase().split(':')[0];
  
  // 3. If the host is the root domain (tivaa.in), redirect to www.tivaa.in
  if (cleanHost === 'tivaa.in') {
    const targetUrl = new URL(
      pathname + request.nextUrl.search,
      'https://www.tivaa.in'
    );
    return NextResponse.redirect(targetUrl, 301);
  }
  
  return NextResponse.next();
}

// Catch all paths so the middleware is guaranteed to run
export const config = {
  matcher: '/:path*',
};

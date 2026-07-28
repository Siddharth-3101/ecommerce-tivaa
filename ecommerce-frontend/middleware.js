import { NextResponse } from 'next/server';

export function middleware(request) {
  const host = request.headers.get('host');
  
  // If request hits the root domain (tivaa.in), redirect to www.tivaa.in
  if (host === 'tivaa.in') {
    const targetUrl = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      'https://www.tivaa.in'
    );
    return NextResponse.redirect(targetUrl, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

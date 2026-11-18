import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';

export async function proxy(request: NextRequest) {
  const user = await getSessionUser(request);
  const pathname = request.nextUrl.pathname;

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  const isApiAuthRoute = pathname.startsWith('/api/auth/');

  // If user is already authenticated and visits login/register, redirect to dashboard
  if (user && isAuthRoute) {
    const rawReturnTo = request.nextUrl.searchParams.get('returnTo');
    const returnTo = rawReturnTo && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')
      ? rawReturnTo
      : '/';
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  // If user is NOT authenticated and visits a protected route
  if (!user && !isAuthRoute && !isApiAuthRoute) {
    // If requesting protected API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    // Redirect browser to login with safe returnTo
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('returnTo', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, manifests (*.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp, manifest.json)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the user is authenticated
  const isAuthenticated = request.cookies.has('auth-token')
  
  // Protect all paths within the dashboard
  if (pathname.startsWith('/(dashboard)') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If the user is authenticated and tries to access auth pages, redirect to dashboard
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/(dashboard)/:path*',
    '/login',
    '/register'
  ],
} 
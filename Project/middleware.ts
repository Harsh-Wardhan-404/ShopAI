import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log(`Middleware processing: ${request.nextUrl.pathname}`)

  // Continue with the request
  return NextResponse.next()
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/:path*',
}

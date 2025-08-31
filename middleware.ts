import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/content', '/room']

export function middleware(req: NextRequest) {
  const token = req.cookies.get('firebaseAuthToken')?.value

  if (protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

// Middleware aktif untuk semua route
export const config = {
  matcher: ['/content', '/room/:path*'],
}

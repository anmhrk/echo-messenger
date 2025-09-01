import { NextRequest, NextResponse } from 'next/server'
import { authClient } from '@/lib/auth-client'

const publicRoutes = ['/', '/login', '/signup']
const protectedRoutesPrefix = '/chats'

export default function middleware(req: NextRequest) {
  const session = authClient.getSession({ fetchOptions: { headers: req.headers } })
  const authenticated = !!session
  const currentPath = req.nextUrl.pathname

  const isProtectedRoute = currentPath.startsWith(protectedRoutesPrefix)
  const isPublicRoute = publicRoutes.includes(currentPath)

  if (authenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/chats', req.url))
  }

  if (!authenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

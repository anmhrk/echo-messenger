import { NextRequest, NextResponse } from 'next/server'
import { authClient } from './lib/auth-client'

const publicRoutes = ['/', '/login', '/signup']
const protectedRoutePrefix = '/chats'

export default async function middleware(req: NextRequest) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: req.headers,
    },
  })
  const authenticated = !!session
  const currentPath = req.nextUrl.pathname

  if (authenticated && publicRoutes.includes(currentPath)) {
    return NextResponse.redirect(new URL('/chats', req.url))
  }

  if (!authenticated && currentPath.startsWith(protectedRoutePrefix)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

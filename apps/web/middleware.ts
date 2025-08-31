import { NextRequest, NextResponse } from 'next/server'
import { checkAuth } from './lib/auth'

const publicRoutes = ['/', '/auth']
const protectedRoutePrefix = '/chats'

export default async function middleware(req: NextRequest) {
  const authenticated = await checkAuth()
  const currentPath = req.nextUrl.pathname

  if (authenticated && publicRoutes.includes(currentPath)) {
    return NextResponse.redirect(new URL('/chats', req.url))
  }

  if (!authenticated && currentPath.startsWith(protectedRoutePrefix)) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

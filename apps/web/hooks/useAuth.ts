'use client'

import { useEffect, useState } from 'react'
import Cookies from '@/node_modules/@types/js-cookie'
import { decodeJwt } from 'jose'
import { fetcher } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { TOKEN_COOKIE } from '@/lib/constants'
import type { User, AuthResult, JwtPayload } from '@/lib/types'

function saveToken(token: string) {
  const payload = decodeJwt(token) as JwtPayload
  const expires = payload?.exp ? new Date(payload.exp * 1000) : undefined
  Cookies.set(TOKEN_COOKIE, token, {
    expires,
    path: '/',
    sameSite: 'lax',
  })
  return payload
}

function clearToken() {
  Cookies.remove(TOKEN_COOKIE, { path: '/' })
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get(TOKEN_COOKIE)
    if (!token) {
      setUser(null)
      return
    }
    const payload = decodeJwt(token) as JwtPayload
    if (payload?.id && payload?.username) {
      setUser({ id: payload.id, username: payload.username })
    } else {
      setUser(null)
    }
  }, [])

  async function signIn(creds: {
    username: string
    password: string
  }): Promise<AuthResult> {
    try {
      const res = await fetcher(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(creds),
        },
        undefined
      )
      if (res?.token) {
        console.log('res.token', res.token)
        const payload = saveToken(res.token)
        if (payload?.id && payload?.username) {
          setUser({ id: payload.id, username: payload.username })
        }
        return { ok: true }
      }
      console.log('res', res)
      const error = res?.error || 'Login failed'
      return { ok: false, error }
    } catch {
      return { ok: false, error: 'Network error' }
    }
  }

  async function signUp(creds: {
    username: string
    password: string
  }): Promise<AuthResult> {
    try {
      const res = await fetcher(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(creds),
        },
        undefined
      )
      if (res?.token) {
        const payload = saveToken(res.token)
        if (payload?.id && payload?.username) {
          setUser({ id: payload.id, username: payload.username })
        }
        return { ok: true }
      }
      const error = res?.error || 'Registration failed'
      return { ok: false, error }
    } catch {
      return { ok: false, error: 'Network error' }
    }
  }

  function signOut(): void {
    clearToken()
    setUser(null)
    router.push('/auth')
  }

  function getAuthToken(): string | undefined {
    return Cookies.get(TOKEN_COOKIE)
  }

  return {
    user,
    signIn,
    signOut,
    signUp,
    getAuthToken,
  }
}

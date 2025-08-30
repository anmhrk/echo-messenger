'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { decodeJwt } from 'jose'
import { fetcher } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const TOKEN_COOKIE = 'auth_token'

export type AuthResult = { ok: true } | { ok: false; error: string }

type JwtPayload = {
  id?: string
  username?: string
  exp?: number // seconds since epoch
}

type User = {
  id: string
  username: string
} | null

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User>(null)
  const router = useRouter()

  useEffect(() => {
    async function verifyExistingToken() {
      const token = Cookies.get(TOKEN_COOKIE)
      if (!token) {
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const res = await fetcher('/auth/token', { method: 'GET' }, token)
        if (res && res.valid) {
          setIsAuthenticated(true)
          const payload = saveToken(token)
          if (payload?.id && payload?.username) {
            setUser({ id: payload.id, username: payload.username })
          }
        } else {
          clearToken()
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch {
        clearToken()
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    verifyExistingToken()
  }, [])

  async function signIn(creds: {
    username: string
    password: string
  }): Promise<AuthResult> {
    try {
      setIsLoading(true)
      const res = await fetcher(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(creds),
        },
        undefined
      )
      if (res?.token) {
        const payload = saveToken(res.token)
        setIsAuthenticated(true)
        if (payload?.id && payload?.username) {
          setUser({ id: payload.id, username: payload.username })
        }
        return { ok: true }
      }
      const error = res?.error || 'Login failed'
      return { ok: false, error }
    } catch {
      return { ok: false, error: 'Network error' }
    } finally {
      setIsLoading(false)
    }
  }

  async function signUp(creds: {
    username: string
    password: string
  }): Promise<AuthResult> {
    try {
      setIsLoading(true)
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
        setIsAuthenticated(true)
        if (payload?.id && payload?.username) {
          setUser({ id: payload.id, username: payload.username })
        }
        return { ok: true }
      }
      const error = res?.error || 'Registration failed'
      return { ok: false, error }
    } catch {
      return { ok: false, error: 'Network error' }
    } finally {
      setIsLoading(false)
    }
  }

  function signOut(): void {
    clearToken()
    setIsAuthenticated(false)
    setUser(null)
    router.push('/auth')
  }

  function getAuthToken(): string | undefined {
    return Cookies.get(TOKEN_COOKIE)
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    signIn,
    signOut,
    signUp,
    getAuthToken,
  }
}

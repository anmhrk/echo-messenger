'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ChatsPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  if (!isAuthenticated || isLoading) {
    return null
  }

  return <div>Hello, {user?.id}</div>
}

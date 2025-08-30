'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ChatsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  if (!isAuthenticated || isLoading) {
    return null
  }

  return (
    <div className="flex-1 text-center items-center justify-center text-muted-foreground text-sm bg-muted hidden md:flex">
      No chat selected.
    </div>
  )
}

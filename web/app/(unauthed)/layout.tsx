'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UnauthedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/chats')
    }
  }, [isAuthenticated, isLoading, router])

  if (isAuthenticated || isLoading) {
    return null
  }

  return (
    <>
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        {children}
      </main>

      <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm z-10">
        <span>
          check out the code on{' '}
          <a
            href="https://github.com/anmhrk/echo"
            className="hover:text-primary/80 transition-colors underline"
            target="_blank"
            rel="noopener"
          >
            github
          </a>
        </span>
      </footer>
    </>
  )
}

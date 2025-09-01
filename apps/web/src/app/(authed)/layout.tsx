'use client'

import ChatsList from '@/components/ChatsList'
import { useWebsocket } from '@/hooks/useWebsocket'
import { usePathname } from 'next/navigation'

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  // Connect websocket on mount
  useWebsocket()

  const pathname = usePathname()
  const isChatOpen = pathname?.startsWith('/chats/') && pathname !== '/chats'

  return (
    <main className="flex h-screen">
      <div
        className={(isChatOpen ? 'hidden md:block' : 'block') + ' w-full flex-shrink-0 md:w-1/4'}
      >
        <ChatsList />
      </div>
      {children}
    </main>
  )
}

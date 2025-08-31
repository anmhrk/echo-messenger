'use client'

import ChatsList from '@/components/ChatsList'
import { useWebsocket } from '@/hooks/useWebsocket'

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Call the hook to connect to the websocket when the client is mounted
  useWebsocket()

  return (
    <main className="flex h-screen">
      <ChatsList />
      {children}
    </main>
  )
}

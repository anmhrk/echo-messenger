import ChatsList from '@/components/ChatsList'
import { useWebsocket } from '@/hooks/useWebsocket'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/chats')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
})

function RouteComponent() {
  // Call the hook to connect to the websocket when the client is mounted
  useWebsocket()

  return (
    <main className="flex h-screen">
      <ChatsList />
      <Outlet />
    </main>
  )
}

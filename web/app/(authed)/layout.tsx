import ChatsList from '@/components/ChatsList'
import { getServerUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()
  if (!user) redirect('/auth')

  return (
    <main className="flex h-screen">
      <ChatsList />
      {children}
    </main>
  )
}

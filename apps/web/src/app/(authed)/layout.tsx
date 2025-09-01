import ChatsList from '@/components/ChatsList'
import { getUser } from '@/lib/get-user'
import { redirect } from 'next/navigation'

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) {
    return redirect('/login')
  }

  return (
    <main className="flex h-screen min-h-0">
      <ChatsList user={user} />
      <div className="flex min-h-0 min-w-0 flex-1">{children}</div>
    </main>
  )
}

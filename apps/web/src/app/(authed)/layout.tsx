import ChatsList from '@/components/ChatsList'
import { getUser } from '@/lib/get-user'
import { redirect } from 'next/navigation'

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) {
    return redirect('/login')
  }

  return (
    <main className="flex h-screen">
      <ChatsList user={user} />
      {children}
    </main>
  )
}

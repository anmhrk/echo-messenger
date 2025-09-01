import ChatContainer from '@/components/ChatContainer'
import { getUser } from '@/lib/get-user'
import { redirect } from 'next/navigation'

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUser()
  if (!user) {
    return redirect('/login')
  }

  return <ChatContainer chatId={id} user={user} />
}

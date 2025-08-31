import ChatsList from '@/components/ChatsList'

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex h-screen">
      <ChatsList />
      {children}
    </main>
  )
}

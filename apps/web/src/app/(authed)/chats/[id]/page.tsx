export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <div className="flex-1 flex-col hidden md:flex bg-muted">{id}</div>
}

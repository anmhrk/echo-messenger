import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chats/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  return <div className="flex-1 flex-col hidden md:flex bg-muted">{id}</div>
}

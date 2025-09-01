import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chats/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex-1 text-center items-center justify-center text-muted-foreground text-sm bg-muted hidden md:flex">
      No chat selected.
    </div>
  )
}

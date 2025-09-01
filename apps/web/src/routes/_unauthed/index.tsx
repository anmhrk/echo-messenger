import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { MessageCircleIcon } from 'lucide-react'

export const Route = createFileRoute('/_unauthed/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="space-y-6 flex flex-col items-center justify-center min-h-screen">
      <MessageCircleIcon className="size-20 text-primary" />
      <h1 className="text-xl md:text-3xl text-center font-semibold">
        Real-time messaging app inspired by WhatsApp
      </h1>
      <Link
        to="/login"
        className="bg-blue-500 hover:bg-blue-500/80 text-white transition-colors px-8 py-3 rounded-full font-semibold"
      >
        Sign in
      </Link>
    </div>
  )
}

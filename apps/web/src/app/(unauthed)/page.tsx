import { MessageCircleIcon } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6">
      <MessageCircleIcon className="text-primary size-20" />
      <h1 className="text-center text-xl font-semibold md:text-3xl">
        Real-time messaging app inspired by WhatsApp
      </h1>
      <Link
        href="/login"
        className="rounded-full bg-blue-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-500/80"
      >
        Sign in
      </Link>
    </div>
  )
}

import { getServerUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function UnauthedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerUser()
  if (user) redirect('/chats')

  return (
    <>
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        {children}
      </main>

      <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm z-10">
        <span>
          check out the code on{' '}
          <a
            href="https://github.com/anmhrk/echo"
            className="hover:text-primary/80 transition-colors underline"
            target="_blank"
            rel="noopener"
          >
            github
          </a>
        </span>
      </footer>
    </>
  )
}

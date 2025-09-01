import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_unauthed')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/chats' })
    }
  },
})

function RouteComponent() {
  return (
    <>
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        <Outlet />
      </main>

      <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm z-10">
        <span>
          check out the code on{' '}
          <a
            href="https://github.com/anmhrk/echo-messenger"
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

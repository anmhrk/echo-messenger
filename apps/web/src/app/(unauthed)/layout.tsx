export default function UnauthedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center">
        {children}
      </main>

      <footer className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform text-sm">
        <span>
          check out the code on{' '}
          <a
            href="https://github.com/anmhrk/echo-messenger"
            className="hover:text-primary/80 underline transition-colors"
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

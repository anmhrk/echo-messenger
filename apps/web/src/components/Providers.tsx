'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from './ui/sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/trpc'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Toaster richColors />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  )
}

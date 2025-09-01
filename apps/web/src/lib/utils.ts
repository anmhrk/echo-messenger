import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import type { AppRouter } from '../../../server/src/routers'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>()

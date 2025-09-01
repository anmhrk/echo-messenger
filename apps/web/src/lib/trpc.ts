import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { inferRouterOutputs } from '@trpc/server'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import type { AppRouter } from '../../../server/src/routers'
import { toast } from 'sonner'
import superjson from 'superjson'

type AppRouterOutputs = inferRouterOutputs<AppRouter>

export type GetChatsOutput = AppRouterOutputs['chatQueries']['getChats']
export type GetChatByIdOutput = AppRouterOutputs['chatQueries']['getChatById']

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message, {
        action: {
          label: 'retry',
          onClick: () => {
            queryClient.invalidateQueries()
          },
        },
      })
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(error.message, {
        action: {
          label: 'retry',
          onClick: () => {
            queryClient.invalidateQueries()
          },
        },
      })
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
})

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
      transformer: superjson,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        })
      },
    }),
  ],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
})

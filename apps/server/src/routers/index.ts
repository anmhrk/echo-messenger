import { router } from '../lib/trpc'
import { chatQueriesRouter } from './chat.queries'
import { chatMutationsRouter } from './chat.mutations'

export const appRouter = router({
  chatQueries: chatQueriesRouter,
  chatMutations: chatMutationsRouter,
})

export type AppRouter = typeof appRouter

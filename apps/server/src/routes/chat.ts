import { Hono } from 'hono'
import { authMiddleware } from '../auth/middleware'
import type { Variables } from '..'

export const chatRoutes = new Hono<{
  Variables: Variables
}>()

chatRoutes.use(authMiddleware)

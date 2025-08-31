import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRoutes } from './routes/auth'
import { chatQueries } from './routes/chat.queries'
import { chatMutations } from './routes/chat.mutations'
import type { JwtPayload } from './auth/jwt'

export type Variables = {
  user: JwtPayload
}

const app = new Hono()

app.use('*', logger())

app.use(
  '*',
  cors({
    origin: Bun.env.FRONTEND_URL!,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
  })
)

app.get('/', (c) => {
  return c.text('Hello from the server!')
})

app.route('/auth', authRoutes)
app.route('/chat', chatQueries)
app.route('/chat', chatMutations)

export default {
  port: 3001,
  fetch: app.fetch,
}

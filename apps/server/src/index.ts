import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRoutes } from './routes/auth'
import { chatQueries } from './routes/chat.queries'
import { chatMutations } from './routes/chat.mutations'
import type { JwtPayload } from './auth/jwt'
import { Server as Engine } from '@socket.io/bun-engine'
import { Server } from 'socket.io'

export type Variables = {
  user: JwtPayload
}

export const io = new Server()
const engine = new Engine()
io.bind(engine)

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('disconnect', () => {
    console.log('a user disconnected')
  })
})

const app = new Hono()

const { websocket } = engine.handler()

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
  idleTimeout: 30,
  fetch(req: Request, server: Bun.Server) {
    const url = new URL(req.url)

    if (url.pathname === '/socket.io/') {
      return engine.handleRequest(req, server)
    } else {
      return app.fetch(req, server)
    }
  },
  websocket,
}

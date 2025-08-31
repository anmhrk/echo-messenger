import { trpcServer } from '@hono/trpc-server'
import { createContext } from './lib/context'
import { appRouter } from './routers/index'
import { auth } from './lib/auth'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { Server as Engine } from '@socket.io/bun-engine'
import { Server } from 'socket.io'
import { setupWebsocket } from './ws'

export const io = new Server()
const engine = new Engine()
io.bind(engine)

// Register websocket handlers
setupWebsocket(io)

const app = new Hono()

const { websocket } = engine.handler()

app.use(logger())
app.use(
  '/*',
  cors({
    origin: Bun.env.CORS_ORIGIN!,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  })
)

app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw))

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context })
    },
  })
)

app.get('/', (c) => {
  return c.text('OK')
})

export default {
  port: 3001,
  idleTimeout: 30,
  fetch(req: Request, server: Bun.Server) {
    const url = new URL(req.url)

    if (url.pathname.startsWith('/socket.io')) {
      return engine.handleRequest(req, server)
    } else {
      return app.fetch(req, server)
    }
  },

  websocket,
}

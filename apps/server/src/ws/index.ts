import type { Server, Socket } from 'socket.io'
import { auth } from '@/lib/auth'

let ioRef: Server | null = null

export type ChatCreatedEvent = {
  chatId: string
  participants: Array<{ id: string; username: string }>
}

export async function setupWebsocket(io: Server) {
  ioRef = io

  io.on('connection', async (socket: Socket) => {
    console.log('socket connected', socket.id)

    const headers = new Headers()
    for (const [key, value] of Object.entries(socket.handshake.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value)
      }
    }

    const session = await auth.api.getSession({
      headers,
    })

    // Try to identify the user from the session and join a user room
    if (session?.user) {
      const room = userRoom(session.user.id)
      socket.join(room)
      socket.data.user = { id: session.user.id, username: session.user.username }
      console.log('socket joined room', room)
    }

    socket.on('disconnect', () => {
      console.log('socket disconnected', socket.id)
    })
  })
}

export function emitNewChat(evt: ChatCreatedEvent) {
  if (!ioRef) return
  for (const p of evt.participants) {
    ioRef.to(userRoom(p.id)).emit('chat:new', evt)
  }
}

function userRoom(userId: string) {
  return `user:${userId}`
}

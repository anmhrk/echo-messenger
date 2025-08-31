import type { Server, Socket } from 'socket.io'
import { verifyJwt } from '../auth/jwt'

let ioRef: Server | null = null

export type ChatCreatedEvent = {
  chatId: string
  participants: Array<{ id: string; username: string }>
}

export function setupWebsocket(io: Server) {
  ioRef = io

  io.on('connection', (socket: Socket) => {
    console.log('socket connected', socket.id)

    // Try to identify the user from the handshake token and join a user room
    const token = (socket.handshake as any)?.auth?.token as string | undefined
    if (token) {
      verifyJwt(token)
        .then((payload) => {
          const room = userRoom(payload.id)
          socket.join(room)
          socket.data.user = { id: payload.id, username: payload.username }
          console.log('socket joined room', room)
        })
        .catch(() => {
          console.warn('invalid socket auth token for', socket.id)
        })
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

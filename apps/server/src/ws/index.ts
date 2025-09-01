import type { Server, Socket } from 'socket.io'
import type { ChatCreatedEvent, MessageCreatedEvent } from '@repo/shared/types'

let ioRef: Server | null = null

export async function setupWebsocket(io: Server) {
  ioRef = io

  io.on('connection', async (socket: Socket) => {
    const { userId, username } = socket.handshake.auth

    if (userId && username) {
      const room = userRoom(userId)
      socket.join(room)
      socket.data.user = { id: userId, username }
      console.log('socket joined', room)
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

export function emitNewMessage(evt: MessageCreatedEvent) {
  if (!ioRef) return
  for (const p of evt.participants) {
    ioRef.to(userRoom(p.id)).emit('message:new', evt)
  }
}

function userRoom(userId: string) {
  return `user:${userId}`
}

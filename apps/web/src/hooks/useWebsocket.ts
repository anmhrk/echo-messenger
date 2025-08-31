import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { ChatCreatedEventSchema } from '@/lib/ws-types'
import { trpc } from '@/lib/trpc'
import type { Chat } from '../../../server/src/routers/chat.queries'
import { authClient } from '@/lib/auth-client'

export const useWebsocket = () => {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      transports: ['websocket'],
      withCredentials: true,
    })

    socket.on('connect', () => {
      console.log('socket connected')
    })
    socket.on('disconnect', () => {
      console.log('socket disconnected')
    })

    socket.on('connect_error', (err) => {
      console.error('connect_error:', err.message, err)
    })
    socket.on('error', (err) => {
      console.error('socket error:', err)
    })

    // Handle new chat creation broadcast
    socket.on('chat:new', (payload) => {
      const parsed = ChatCreatedEventSchema.safeParse(payload)
      if (!parsed.success) {
        console.error('Invalid chat:new payload', parsed.error)
        return
      }

      const { chatId, participants } = parsed.data
      const queryKey = trpc.chatQueries.getChats.queryKey()

      // Only update if the current user participates in this chat
      if (!session?.user?.id || !participants.some((p) => p.id === session.user.id)) return

      // Build a ChatListItem for this client
      const other = participants.find((p) => p.id !== session.user.id) ?? null
      const newItem: Chat = {
        id: chatId,
        otherParticipant: other
          ? { id: other.id, username: other.username, image: null }
          : undefined,
        lastMessageSentAt: undefined,
        lastMessageContent: undefined,
      }

      queryClient.setQueryData<Chat[] | undefined>(queryKey, (old) => {
        const existing = old ?? []
        if (existing.some((c) => c.id === chatId)) return existing
        return [newItem, ...existing]
      })
    })

    return () => {
      socket.close()
    }
  }, [session?.user?.id])
}

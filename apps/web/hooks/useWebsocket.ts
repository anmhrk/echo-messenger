import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import type { ChatListItem } from '@/lib/types'
import { ChatCreatedEventSchema } from '@/lib/types'

export const useWebsocket = () => {
  const queryClient = useQueryClient()
  const { user, getAuthToken } = useAuth()

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      transports: ['websocket'],
      withCredentials: true,
      auth: { token: getAuthToken?.() },
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

      // Only update if the current user participates in this chat
      if (!user?.id || !participants.some((p) => p.id === user.id)) return

      // Build a ChatListItem for this client
      const other = participants.find((p) => p.id !== user?.id) ?? null
      const newItem: ChatListItem = {
        id: chatId,
        otherParticipant: other
          ? { id: other.id, username: other.username }
          : null,
        latestMessage: undefined,
      }

      queryClient.setQueryData<ChatListItem[] | undefined>(
        ['chats', user.id],
        (old) => {
          const existing = old ?? []
          if (existing.some((c) => c.id === chatId)) return existing
          return [newItem, ...existing]
        }
      )
    })

    return () => {
      socket.close()
    }
  }, [user?.id])
}

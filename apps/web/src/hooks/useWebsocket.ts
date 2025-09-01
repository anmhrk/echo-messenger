'use client'

import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { ChatCreatedEventSchema } from '@repo/shared/types'
import { trpc } from '@/lib/trpc'
import type { Chat } from '../../../server/src/routers/chat-queries'
import { authClient } from '@/lib/auth-client'

export const useWebsocket = () => {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  useEffect(() => {
    // Only connect once we have a valid user session
    if (!session?.user?.id) return

    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      transports: ['websocket'],
      withCredentials: true,
      // TODO: in the future, replace this with proper token flow or header/getSession based check
      auth: { userId: session?.user?.id, username: session?.user?.username },
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

    socket.on('chat:new', (payload) => {
      console.log('chat:new', payload)
      const parsed = ChatCreatedEventSchema.safeParse(payload)
      if (!parsed.success) {
        console.error('Invalid chat:new payload', parsed.error)
        return
      }

      const { chatId, participants } = parsed.data
      const queryKey = trpc.chatQueries.getChats.queryKey({ userId: session.user.id })

      // Only update if the current user participates in this chat
      if (!session?.user?.id || !participants.some((p) => p.id === session.user.id)) return

      // Build a Chat item for this client
      const other = participants.find((p) => p.id !== session.user.id) ?? null
      const newItem: Chat = {
        id: chatId,
        otherParticipant: other
          ? { id: other.id, username: other.username ?? null, image: null }
          : undefined,
        lastMessageSentAt: null,
        lastMessageContent: null,
      }

      // Update the chats list
      queryClient.setQueryData<Chat[] | undefined>(queryKey, (old) => {
        const existing = old ?? []
        if (existing.some((c) => c.id === chatId)) return existing
        return [newItem, ...existing]
      })
    })

    // Cleanup the socket when the component unmounts
    return () => {
      socket.close()
    }
  }, [session?.user?.id])
}

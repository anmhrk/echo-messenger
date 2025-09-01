'use client'

import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { ChatCreatedEventSchema, MessageCreatedEventSchema } from '@repo/shared/types'
import { trpc } from '@/lib/trpc'
import type { GetChatsOutput, GetChatByIdOutput } from '@/lib/trpc'
import type { User } from '@/lib/auth-client'

export function useWebsocket(user: User) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      transports: ['websocket'],
      withCredentials: true,
      auth: { userId: user.id, username: user.username },
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
      const queryKey = trpc.chatQueries.getChats.queryKey({ userId: user.id })

      // Only update if the current user participates in this chat
      if (!participants.some((p) => p.id === user.id)) return

      // Build a Chat item for this client
      const other = participants.find((p) => p.id !== user.id) ?? null
      const newItem: GetChatsOutput[number] = {
        id: chatId,
        otherParticipant: other
          ? { id: other.id, username: other.username ?? null, image: null }
          : undefined,
        lastMessageSentAt: null,
        lastMessageContent: null,
      }

      // Update the chats list
      queryClient.setQueryData<GetChatsOutput | undefined>(queryKey, (old) => {
        const existing = old ?? []
        if (existing.some((c) => c.id === chatId)) return existing
        return [newItem, ...existing]
      })
    })

    socket.on('message:new', (payload) => {
      console.log('message:new', payload)
      const parsed = MessageCreatedEventSchema.safeParse(payload)
      if (!parsed.success) {
        console.error('Invalid message:new payload', parsed.error)
        return
      }

      const { chatId, participants, message } = parsed.data
      // Only process if current user is a participant
      if (!participants.some((p) => p.id === user.id)) return

      // Update chat detail (messages) cache
      const chatDetailKey = trpc.chatQueries.getChatById.queryKey({ chatId })
      queryClient.setQueryData<GetChatByIdOutput | undefined>(chatDetailKey, (old) => {
        if (!old) return old
        const next = { ...old }
        next.messages = [
          ...old.messages,
          {
            id: message.id,
            content: message.content,
            sentAt: new Date(message.sentAt),
            sender: {
              id: message.sender?.id ?? '',
              username: message.sender?.username ?? null,
              image: message.sender?.image ?? null,
            },
          },
        ]
        return next
      })

      // Update chat list cache
      const chatsListKey = trpc.chatQueries.getChats.queryKey({ userId: user.id })
      queryClient.setQueryData<GetChatsOutput | undefined>(chatsListKey, (old) => {
        const list = old ? [...old] : []
        const idx = list.findIndex((c) => c.id === chatId)
        if (idx === -1) return list
        const chat = { ...list[idx] }
        chat.lastMessageContent = message.content
        chat.lastMessageSentAt = new Date(message.sentAt)
        // move to top
        list.splice(idx, 1)
        return [chat, ...list]
      })
    })

    return () => {
      socket.close()
    }
  }, [])
}

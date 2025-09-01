'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { GetChatByIdOutput, trpc } from '@/lib/trpc'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, SmilePlus, X } from 'lucide-react'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Messages } from './Messages'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useTheme } from 'next-themes'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { User } from 'better-auth'

export default function ChatContainer({ chatId, user }: { chatId: string; user: User }) {
  const router = useRouter()
  const { theme } = useTheme()
  const [message, setMessage] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)

  const {
    data: chat,
    isLoading,
    error,
    isError,
  } = useQuery(trpc.chatQueries.getChatById.queryOptions({ chatId }))

  useEffect(() => {
    if (isError) {
      toast.error(error?.message ?? 'Error fetching chat')
      router.push('/chats')
    }
  }, [isError, error, router])

  // If chat is not found, route away
  useEffect(() => {
    if (!isLoading && !chat) {
      toast.error(`Chat ${chatId} not found`)
      router.push('/chats')
    }
  }, [isLoading, chat, router, chatId])

  const otherParticipant = useMemo(() => {
    if (!chat) return null
    return (
      chat.chatParticipants?.find(
        (p: GetChatByIdOutput['chatParticipants'][number]) => p.id !== user.id
      ) ?? null
    )
  }, [chat, user.id])

  const sendMessage = useMutation(trpc.chatMutations.sendMessage.mutationOptions())

  return (
    <div className="bg-muted flex flex-1 flex-col">
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="bg-background/80 flex h-14 items-center gap-3 border-b border-gray-200 px-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={otherParticipant?.image ?? undefined}
                  alt={otherParticipant?.username ?? ''}
                />
                <AvatarFallback className="bg-primary/10 hover:bg-primary/10">
                  {otherParticipant?.username?.slice(0, 1).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="font-medium">{otherParticipant?.username ?? 'Unknown User'}</div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="ml-auto flex md:hidden"
              onClick={() => router.push('/chats')}
            >
              <X className="size-5" />
            </Button>
          </div>

          <Messages messages={chat?.messages ?? []} currentUserId={user.id ?? ''} />

          <div className="bg-background/80 border-t border-gray-200 p-3 dark:border-zinc-800">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage.mutate({ chatId, content: message.trim() })
                setMessage('')
              }}
              className="flex items-center gap-2"
            >
              <Input
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 pr-12 focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    e.currentTarget.form?.requestSubmit()
                  }
                }}
              />
              <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="Open emoji picker"
                  >
                    <SmilePlus className="size-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-fit overflow-hidden p-0">
                  <EmojiPicker
                    lazyLoadEmojis
                    theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                    width={320}
                    onEmojiClick={(emoji) => {
                      setMessage((prev) => prev + emoji.emoji)
                      setEmojiOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

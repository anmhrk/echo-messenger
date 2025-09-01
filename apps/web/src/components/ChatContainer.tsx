'use client'

import { useQuery } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, SmilePlus, X } from 'lucide-react'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Messages } from './Messages'
import { authClient } from '@/lib/auth-client'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useTheme } from 'next-themes'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'

export default function ChatContainer({ chatId }: { chatId: string }) {
  const router = useRouter()
  const { theme } = useTheme()
  const { data: session } = authClient.useSession()
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
    if (!chat || !session?.user?.id) return null
    return (
      chat.chatParticipants
        ?.map((cp: any) => cp.user)
        .find((u: any) => u.id !== session.user!.id) ?? null
    )
  }, [chat, session?.user?.id])

  return (
    <div className="flex-1 flex flex-col bg-muted">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="h-14 px-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3 bg-background/80">
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

          <Messages
            messages={(chat?.messages ?? []).map((m) => ({ ...m, sentAt: new Date(m.sentAt) }))}
            currentUserId={session?.user?.id ?? ''}
          />

          <div className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-background/80">
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
              <Input
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 pr-12 focus-visible:ring-0"
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
                <PopoverContent align="end" className="p-0 w-fit overflow-hidden">
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

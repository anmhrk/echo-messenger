'use client'

import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Settings from './Settings'
import NewChatDialog from './NewChatDialog'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { format, isThisYear, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import { Skeleton } from './ui/skeleton'
import { usePathname } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { authClient } from '@/lib/auth-client'

export default function ChatsList() {
  const [search, setSearch] = useState('')
  const pathname = usePathname()
  const chatId = pathname.split('/chats/')[1]
  const { data: session } = authClient.useSession()

  const { data: chats, isLoading } = useQuery(
    trpc.chatQueries.getChats.queryOptions(
      {
        userId: session?.user?.id ?? '',
      },
      {
        enabled: !!session?.user?.id,
      }
    )
  )

  const filteredChats = useMemo(() => {
    const list = chats ?? []
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter((c) => {
      const name = c.otherParticipant?.username?.toLowerCase() ?? ''
      const last = c.lastMessageContent?.toLowerCase() ?? ''
      return name.includes(q) || last.includes(q)
    })
  }, [chats, search])

  function renderLastMessageTime(sentAt?: string) {
    if (!sentAt) return null
    const d = new Date(sentAt)
    if (isToday(d)) return format(d, 'p')
    if (isThisYear(d)) return format(d, 'MMM d')
    return format(d, 'MMM d, yyyy')
  }

  return (
    <div className="flex h-full w-full flex-shrink-0 flex-col space-y-4 border-r border-gray-200 p-3 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <Link className="cursor-pointer text-lg font-medium" href="/chats">
          Chats
        </Link>
        <div className="flex items-center">
          <Settings />
          <NewChatDialog />
        </div>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search your chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 focus-visible:ring-0"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-13 w-full" />
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-center text-sm">
            No chats found. Create one to start chatting.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chats/${chat.id}`}
                className={cn(
                  'hover:bg-accent block rounded-lg',
                  chat.id === chatId && 'bg-primary/10 hover:bg-primary/10'
                )}
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={chat.otherParticipant?.image ?? undefined}
                      alt={chat.otherParticipant?.username ?? ''}
                    />
                    <AvatarFallback className="bg-primary/10 hover:bg-primary/10">
                      {chat.otherParticipant?.username?.slice(0, 1).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="line-clamp-1 truncate font-medium">
                        {chat.otherParticipant?.username || 'Unknown User'}
                      </div>
                      <div className="text-muted-foreground ml-2 shrink-0 text-xs">
                        {renderLastMessageTime(chat.lastMessageSentAt?.toISOString() ?? undefined)}
                      </div>
                    </div>
                    <div className="text-muted-foreground line-clamp-2 truncate text-sm">
                      {chat.lastMessageContent || 'Say hello 👋'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

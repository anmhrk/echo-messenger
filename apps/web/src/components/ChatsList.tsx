'use client'

import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Settings from './Settings'
import NewChatDialog from './NewChatDialog'
import Link from 'next/link'
import { cn, formatDate } from '@/lib/utils'
import { Skeleton } from './ui/skeleton'
import { usePathname } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { useWebsocket } from '@/hooks/useWebsocket'
import type { User } from '@/lib/auth-client'
import UserAvatar from './UserAvatar'

export default function ChatsList({ user }: { user: User }) {
  const [search, setSearch] = useState('')
  const pathname = usePathname()
  const chatId = pathname.split('/chats/')[1]

  // Connect websocket on mount with provided user
  useWebsocket(user)

  const { data: chats, isLoading } = useQuery(
    trpc.chatQueries.getAllChats.queryOptions({
      userId: user.id,
    })
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

  const isChatOpen = pathname?.startsWith('/chats/') && pathname !== '/chats'

  return (
    <div className={(isChatOpen ? 'hidden md:block' : 'block') + ' w-full flex-shrink-0 md:w-1/4'}>
      <div className="flex h-full w-full flex-col space-y-4 border-r border-gray-200 p-3 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <Link className="cursor-pointer text-lg font-medium" href="/chats">
            Chats
          </Link>
          <div className="flex items-center">
            <Settings />
            <NewChatDialog user={user} />
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
                    <UserAvatar image={chat.otherParticipant?.image ?? null} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="line-clamp-1 truncate font-medium">
                          {chat.otherParticipant?.username || 'Unknown User'}
                        </div>
                        <div className="text-muted-foreground ml-2 shrink-0 text-xs">
                          {chat.lastMessageSentAt && formatDate(chat.lastMessageSentAt)}
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
    </div>
  )
}

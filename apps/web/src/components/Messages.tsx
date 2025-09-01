'use client'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { cn } from '@/lib/utils'
import { ChatMessage } from '../../../server/src/routers/chat-queries'

export function Messages({
  messages,
  currentUserId,
}: {
  messages: ChatMessage[]
  currentUserId: string
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {messages.map((m) => {
        const sender = m.sender
        const isOwn = (sender?.id ?? m.senderId) === currentUserId
        const initials = (sender?.username ?? '?').slice(0, 1).toUpperCase()

        return (
          <div
            key={m.id}
            className={cn('flex items-end gap-2', isOwn ? 'justify-end' : 'justify-start')}
          >
            {!isOwn && (
              <Avatar className="h-9 w-9">
                <AvatarImage src={sender?.image ?? undefined} alt={sender?.username ?? ''} />
                <AvatarFallback className="bg-primary/10 hover:bg-primary/10">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
            <div className={cn('flex max-w-[75%] flex-col', isOwn ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'rounded-2xl px-3 py-2 text-sm',
                  isOwn ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground'
                )}
              >
                {m.content}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {sender?.username ?? 'Unknown User'}
              </div>
            </div>
            {isOwn && (
              <Avatar className="h-9 w-9">
                <AvatarImage src={sender?.image ?? undefined} alt={sender?.username ?? ''} />
                <AvatarFallback className="bg-primary/10 hover:bg-primary/10">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        )
      })}
    </div>
  )
}

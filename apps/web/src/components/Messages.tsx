'use client'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { cn } from '@/lib/utils'
import type { GetChatByIdOutput } from '@/lib/trpc'
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom'
import { Button } from './ui/button'
import { ArrowDown } from 'lucide-react'

export function Messages({
  messages,
  currentUserId,
}: {
  messages: GetChatByIdOutput['messages']
  currentUserId: string
}) {
  return (
    <StickToBottom className="relative min-h-0 flex-1" resize="smooth" initial="instant">
      <StickToBottom.Content className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const sender = m.sender
          const isOwn = (sender?.id ?? m.sender?.id) === currentUserId
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
                <div className="text-muted-foreground mt-1 text-xs">
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
        <ScrollToBottom />
      </StickToBottom.Content>
    </StickToBottom>
  )
}

function ScrollToBottom() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext()

  return (
    !isAtBottom && (
      <Button
        size="icon"
        variant="outline"
        className="absolute bottom-3 left-[50%] translate-x-[-50%] rounded-full shadow-lg"
        onClick={() => scrollToBottom()}
      >
        <ArrowDown className="size-5" />
      </Button>
    )
  )
}

import { protectedProcedure } from '../lib/trpc'
import { z } from 'zod'
import { db } from '../db'
import { chatParticipants, chats } from '../db/schema'
import { TRPCError } from '@trpc/server'
import { emitNewChat } from '../ws'

export const chatMutationsRouter = {
  createChat: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingChat = await db.query.chatParticipants.findFirst({
        where: (cp, { and, eq }) =>
          and(eq(cp.userId, ctx.session.user.id), eq(cp.userId, input.targetUserId)),
      })

      if (existingChat) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Chat already exists with this user',
        })
      }

      const chatId = crypto.randomUUID()

      await db.transaction(async (tx) => {
        await tx.insert(chats).values({
          id: chatId,
        })

        const bothUsers = [ctx.session.user.id, input.targetUserId]
        await tx.insert(chatParticipants).values(
          bothUsers.map((userId) => ({
            chatId,
            userId,
          }))
        )
      })

      // Fetch minimal participant info (id, username) for event payload
      const participants = await db.query.user.findMany({
        columns: { id: true, username: true },
        where: (u, { inArray }) => inArray(u.id, [ctx.session.user.id, input.targetUserId]),
      })

      // Broadcast new chat event to all connected clients
      emitNewChat({
        chatId,
        participants: participants.map((p) => ({
          id: p.id,
          username: p.username!,
        })),
      })

      return { chatId }
    }),
}

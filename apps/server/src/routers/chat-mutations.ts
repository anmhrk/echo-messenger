import { protectedProcedure } from '../lib/trpc'
import { z } from 'zod'
import { db } from '../db'
import { chatParticipants, chats, messages } from '../db/schema'
import { TRPCError } from '@trpc/server'
import { emitNewChat, emitNewMessage } from '../ws'
import { sql, inArray, eq } from 'drizzle-orm'
import type { MessageCreatedEvent } from '@repo/shared/types'

export const chatMutationsRouter = {
  createChat: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if a chat already exists that includes BOTH users via a select
      const existing = await db
        .select({ chatId: chatParticipants.chatId, count: sql<number>`count(*)` })
        .from(chatParticipants)
        .where(inArray(chatParticipants.userId, [ctx.session.user.id, input.targetUserId]))
        .groupBy(chatParticipants.chatId)
        .having(sql`count(*) = 2`)
        .limit(1)

      if (existing.length > 0) {
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

      const participants = await db.query.user.findMany({
        columns: { id: true, username: true, image: true },
        where: (u, { inArray }) => inArray(u.id, [ctx.session.user.id, input.targetUserId]),
      })

      // Broadcast new chat event to all connected clients
      emitNewChat({
        chatId,
        participants,
      })

      return { chatId }
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const now = new Date()
      const messageId = crypto.randomUUID()

      // Query participants to target WS recipients
      const participantIds = (
        await db.query.chatParticipants.findMany({
          where: (cp, { eq }) => eq(cp.chatId, input.chatId),
          with: {
            user: {
              columns: { id: true },
            },
          },
        })
      ).map((cp) => cp.user.id)

      const evt: MessageCreatedEvent = {
        chatId: input.chatId,
        participantIds,
        message: {
          id: messageId,
          content: input.content,
          sentAt: now.toISOString(),
          sender: {
            id: ctx.session.user.id,
            username: ctx.session.user.username ?? null,
            image: ctx.session.user.image ?? null,
          },
        },
      }

      // Optimistically emit before persisting
      emitNewMessage(evt)

      await db.transaction(async (tx) => {
        await tx.insert(messages).values({
          id: messageId,
          chatId: input.chatId,
          senderId: ctx.session.user.id,
          content: input.content,
          sentAt: now,
        })

        await tx.update(chats).set({ lastMessageSentAt: now }).where(eq(chats.id, input.chatId))
      })
    }),
}

import { protectedProcedure } from '../lib/trpc'
import { z } from 'zod'
import { db } from '../db'
import { and, sql } from 'drizzle-orm'
import { chatParticipants } from '../db/schema'
import { TRPCError } from '@trpc/server'

export const chatQueriesRouter = {
  searchUsers: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await db.query.user.findMany({
        columns: {
          id: true,
          username: true,
        },
        where: (u, { ilike, not, eq }) =>
          and(
            ilike(u.username, `%${input.query.split(' ').join('%')}%`),
            not(eq(u.id, ctx.session.user.id))
          ),
        limit: 20,
      })
    }),

  getChats: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.session.user.id !== input.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Forbidden' })
      }

      const raw = await db.query.chats.findMany({
        // only get chats that the user is a participant of
        where: (ch, { exists, and, eq }) =>
          exists(
            db
              .select({ one: sql`1` })
              .from(chatParticipants)
              .where(
                and(eq(chatParticipants.chatId, ch.id), eq(chatParticipants.userId, input.userId))
              )
          ),
        with: {
          chatParticipants: {
            columns: {}, // no columns from chatParticipants
            with: {
              user: {
                columns: {
                  id: true,
                  username: true,
                  image: true,
                },
              },
            },
          },
          messages: {
            orderBy: (m, { desc }) => desc(m.sentAt), // pick the latest message
            limit: 1,
            columns: {
              content: true,
            },
          },
        },
        orderBy: (ch, { desc }) => desc(ch.lastMessageSentAt), // order the whole list by the latest message sent at
      })

      return raw.map((chat) => ({
        id: chat.id,
        lastMessageSentAt: chat.lastMessageSentAt,
        lastMessageContent: chat.messages[0]?.content || null,
        otherParticipant: chat.chatParticipants.find((cp) => cp.user.id !== input.userId)?.user,
      }))
    }),
}

export type Chat = Awaited<ReturnType<typeof chatQueriesRouter.getChats>>[number]

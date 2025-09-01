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

  getChatById: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const chat = await db.query.chats.findFirst({
        where: (ch, { eq, exists, and }) =>
          and(
            eq(ch.id, input.chatId),
            exists(
              db
                .select({ one: sql`1` })
                .from(chatParticipants)
                .where(
                  and(
                    eq(chatParticipants.chatId, ch.id),
                    eq(chatParticipants.userId, ctx.session.user.id)
                  )
                )
            )
          ),
        with: {
          messages: {
            orderBy: (m, { asc }) => asc(m.sentAt),
            with: {
              sender: {
                columns: {
                  id: true,
                  username: true,
                  image: true,
                },
              },
            },
          },
          chatParticipants: {
            columns: {},
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
        },
      })

      if (!chat) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat not found' })
      }

      return {
        id: chat.id,
        lastMessageContent:
          chat.messages.find((m) => m.sentAt?.getTime?.() === chat.lastMessageSentAt?.getTime?.())
            ?.content ?? null, // needed to update the chat list cache
        chatParticipants: chat.chatParticipants.map((cp) => ({
          id: cp.user.id,
          image: cp.user.image,
          username: cp.user.username,
        })), // needed to send the chat detail to participating clients
        messages: chat.messages.map((m) => ({
          id: m.id,
          content: m.content,
          sentAt: m.sentAt,
          sender: {
            id: m.sender.id,
            username: m.sender.username,
            image: m.sender.image,
          },
        })),
      }
    }),
}

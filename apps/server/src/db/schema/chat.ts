import { pgTable, timestamp, text, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { user } from './auth'

export const chats = pgTable('chats', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastMessageSentAt: timestamp('last_message_sent_at'),
})

export const chatParticipants = pgTable(
  'chat_participants',
  {
    chatId: text('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.chatId, table.userId] })]
)

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  sentAt: timestamp('sent_at').notNull().defaultNow(),
  chatId: text('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  senderId: text('sender_id')
    .notNull()
    // TODO: nullify/anonymize the sender if they are deleted
    // will be useful for group chats later
    // also make senderId nullable
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const userRelations = relations(user, ({ many }) => ({
  chats: many(chats),
  chatParticipants: many(chatParticipants),
  messages: many(messages),
}))

export const chatsRelations = relations(chats, ({ many }) => ({
  chatParticipants: many(chatParticipants),
  messages: many(messages),
}))

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  chat: one(chats, {
    fields: [chatParticipants.chatId],
    references: [chats.id],
  }),
  user: one(user, {
    fields: [chatParticipants.userId],
    references: [user.id],
  }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(user, {
    fields: [messages.senderId],
    references: [user.id],
  }),
}))

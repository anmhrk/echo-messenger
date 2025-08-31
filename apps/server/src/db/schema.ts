import {
  pgTable,
  varchar,
  timestamp,
  text,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const chats = pgTable('chats', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const chatParticipants = pgTable(
  'chat_participants',
  {
    chatId: text('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
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
    // nullify/anonymize the sender if they are deleted
    .references(() => users.id, { onDelete: 'set null' }),
})

import { timeStamp } from 'console';
import { relations } from 'drizzle-orm';
import {integer, pgEnum, pgTable, serial, text, timestamp, uuid, varchar} from 'drizzle-orm/pg-core'


export const userSystemEnum = pgEnum('user_sytem_enum', ['system', 'user'])

export const chats = pgTable('chats', {
    id: serial('id').primaryKey(),
    fileName: text('file_name').notNull(),
    fileUrl: text('file_url').notNull(),
    fileType: text('file_type').notNull().default('application/pdf'),
    checksum: varchar('checksum', {length: 256}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
    userId: varchar('user_id', {length: 256}).notNull(),
    fileKey: text('file_key').notNull(),
})


export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    chatId: integer('chat_id').references(() => chats.id).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
    role: userSystemEnum('role').notNull(),
    regenerationCount: integer('regeneration_count').notNull().default(0),
    previousVersions: text('previous_versions').array(),
    regenerationLabels: text('regeneration_labels').array(),
})

export const userSubscriptions = pgTable('user_subscriptions', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 256 }).notNull().unique(),
    stripeCustomerId: varchar('stripe_customer_id', { length: 256 }).notNull().unique(),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 256 }).unique(),
    stripePriceId: varchar('stripe_price_id', { length: 256 }),
    stripeCurrentPeriodEnd: timestamp('stripe_current_period_end')
})

export const sharedChats = pgTable('shared_chats', {
    id: uuid('id').defaultRandom().primaryKey(),
    messages: text('messages').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at'),
    userId: text('user_id').notNull(),
    chatId: text('chat_id').notNull(),
  });

export const chatRelations = relations(chats, ({ many }) => ({
    messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
	chat: one(chats, { fields: [messages.chatId], references: [chats.id] }),
}));
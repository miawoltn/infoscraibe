import { relations } from 'drizzle-orm';
import { decimal, integer, json, pgEnum, pgTable, serial, text, timestamp, uuid, varchar} from 'drizzle-orm/pg-core'


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
    feedback: text('feedback'),  // 'like' | 'dislike' | null
    feedbackReason: text('feedback_reason'),
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

export const userCredits = pgTable('user_credits', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 256 }).notNull().unique(),
    credits: decimal('credits', { precision: 10, scale: 2 }).notNull().default('0.00'),
    lastUpdated: timestamp('last_updated').notNull().defaultNow(),
    reminderThreshold: decimal('reminder_threshold', { precision: 10, scale: 2 }),
});

export const creditTransactions = pgTable('credit_transactions', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 256 }).notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(), // 'topup', 'chat', 'storage'
    tokenCount: integer('token_count'), // For chat transactions
    storageSize: decimal('storage_size', { precision: 10, scale: 2 }), // For storage transactions (in MB)
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    metadata: json('metadata')
});

export const chatRelations = relations(chats, ({ many }) => ({
    messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
	chat: one(chats, { fields: [messages.chatId], references: [chats.id] }),
}));
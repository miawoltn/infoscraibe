import { NeonQueryFunction, neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { UserSubscription, chats, messages, userSubscriptions } from "./schema"
import { and, eq } from "drizzle-orm"


if(!process.env.DATABASE_URL) {
    throw new Error("databse url not found")
}

const sql: NeonQueryFunction<boolean, boolean> = neon(process.env.DATABASE_URL)

export const db = drizzle(sql)

export const getChatById = async (chatId: number) => (await db.select().from(chats).where(eq(chats.id, chatId)))[0];

export const getChatsByUserId = async (userId: string) => (await db.select().from(chats).where(eq(chats.userId, userId)));

export const getChatByUserId = async (userId: string) => (await db.select().from(chats).where(eq(chats.userId, userId)))[0];

export const getChatByUserIdAndChatId = async (userId: string, chatId: number) => (await db.select().from(chats).where(and(eq(chats.userId, userId), eq(chats.id, chatId))))[0];

export const getMessagesByChatId = async (chatId: number) => await db.select().from(messages).where(eq(messages.chatId, chatId));

export const getSubscriptionByUserId = async (userId: string) => (await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId)))[0];

export const insertSubscription = async (userSubscription: UserSubscription) => (await db.insert(userSubscriptions).values(userSubscription));

export const updateSubscriptionBySubId = async (subId: string, userSubscription: {}) => (await db.update(userSubscriptions).set(userSubscription).where(eq(userSubscriptions.stripeSubscriptionId, subId)));
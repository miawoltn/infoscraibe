import { NeonQueryFunction, neon } from "@neondatabase/serverless"
// import { drizzle } from "drizzle-orm/neon-http"
import { drizzle } from "drizzle-orm/postgres-js"
import { chats, messages, userSubscriptions } from "./schema"
import * as schema from "./schema";
import { and, eq } from "drizzle-orm"
import postgres from 'postgres';



if(!process.env.DATABASE_URL) {
    throw new Error("databse url not found")
}

const sql: NeonQueryFunction<boolean, boolean> = neon(process.env.DATABASE_URL)

const pg = postgres(process.env.DATABASE_URL)


export const db = drizzle(pg, { schema })

// const Chat = chats.

export type UserSubscription = typeof userSubscriptions.$inferSelect | typeof userSubscriptions.$inferInsert

export const getChatById = async (chatId: number) => await db.query.chats.findFirst({
    where: eq(chats.id, chatId)
})

export const getChatsByUserId = async (userId: string) => await db.query.chats.findMany({
    where: eq(chats.userId, userId),
    with: {
        messages: true,
    }
})

export const getChatByUserId = async (userId: string) => await db.query.chats.findFirst({
    where: eq(chats.userId, userId)
})

export const getChatByUserIdAndChatId = async (userId: string, chatId: number) => await db.query.chats.findFirst({
    where: and(eq(chats.userId, userId), eq(chats.id, chatId))
})

export const getMessagesByChatId = async (chatId: number) => await db.query.messages.findMany({
    where: eq(messages.chatId, chatId)
})

export const getSubscriptionByUserId = async (userId: string) => await db.query.userSubscriptions.findFirst({
    where:eq(userSubscriptions.userId, userId)
})

export const insertSubscription = async (userSubscription: UserSubscription) => await db.insert(userSubscriptions).values(userSubscription);

export const updateSubscriptionBySubId = async (subId: string, userSubscription: {}) => await db.update(userSubscriptions).set(userSubscription).where(eq(userSubscriptions.stripeSubscriptionId, subId));
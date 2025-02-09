import { NeonQueryFunction, neon } from "@neondatabase/serverless"
// import { drizzle } from "drizzle-orm/neon-http"
import { drizzle } from "drizzle-orm/postgres-js"
import { chats, messages, sharedChats, userSubscriptions } from "./schema"
import * as schema from "./schema";
import { and, eq, isNull, or } from "drizzle-orm"
import postgres from 'postgres';



if(!process.env.DATABASE_URL) {
    throw new Error("databse url not found")
}

const sql: NeonQueryFunction<boolean, boolean> = neon(process.env.DATABASE_URL)

const pg = postgres(process.env.DATABASE_URL, { max: 2})


export const db = drizzle(pg, { schema })

// const Chat = chats.

export type UserSubscription = typeof userSubscriptions.$inferSelect | typeof userSubscriptions.$inferInsert
export type Chats = typeof chats.$inferSelect | typeof chats.$inferInsert
export type Messages = typeof messages.$inferSelect | typeof messages.$inferInsert

export const insertChat = async (chat: Chats) => await db.insert(chats).values(chat);

export const updateChatById = async (id: number, chat: {}) => await db.update(chats).set(chat).where(eq(chats.id, id));


export const getChatById = async (chatId: number) => await db.query.chats.findFirst({
    where: eq(chats.id, chatId)
})

export const getChatsByUserId = async (userId: string) => await db.query.chats.findMany({
    where: and(eq(chats.userId, userId), isNull(chats.deletedAt)),
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

export const getChatByUserIdAndChecksum = async (userId: string, checksum: string) => await db.query.chats.findFirst({
    where: and(eq(chats.userId, userId), eq(chats.checksum, checksum))
})

export const getMessagesByChatId = async (chatId: number) => await db.query.messages.findMany({
    where: and(eq(messages.chatId, chatId), isNull(messages.deletedAt))
})

export const getSubscriptionByUserId = async (userId: string) => await db.query.userSubscriptions.findFirst({
    where:eq(userSubscriptions.userId, userId)
})

export const insertSubscription = async (userSubscription: UserSubscription) => await db.insert(userSubscriptions).values(userSubscription);

export const updateSubscriptionBySubId = async (subId: string, userSubscription: {}) => await db.update(userSubscriptions).set(userSubscription).where(eq(userSubscriptions.stripeSubscriptionId, subId));

export const deleteChatById = async (chatId: number) => await db.update(chats).set({
    deletedAt: new Date()
}).where(eq(chats.id, chatId));

export const deleteChatByFileKey = async (fileKey: string) => await db.update(chats).set({
    deletedAt: new Date()
}).where(eq(chats.fileKey, fileKey));

export const getSharedChatById = async (id: string) => await db.query.sharedChats.findFirst({
    where: eq(sharedChats.id, id)
})

export const updateMessageById = async (id: number, content: string) => await db.update(messages).set({ content }).where(eq(messages.id, id));

export const getMessageById = async (id: number) => await db.query.messages.findFirst({
    where:eq(messages.id, id)
})


export const updateMessageWithVersion = async (id: number, content: string) => {
    const message = await db.query.messages.findFirst({
        where: eq(messages.id, id)
    });

    if (!message) throw new Error('Message not found');
    if (message.regenerationCount >= 3) throw new Error('Maximum regenerations reached');

    // Store current content in previous versions
    const previousVersions = message.previousVersions || [];
    previousVersions.push(message.content);

    const updatedMessage =  await db.update(messages)
        .set({ 
            content,
            regenerationCount: message.regenerationCount + 1,
            previousVersions
        })
        .where(eq(messages.id, id))
        .returning();

    return updatedMessage[0];
};

export const deleteMessageVersion = async (messageId: number, versionIndex: number) => {
    const message = await db.query.messages.findFirst({
        where: eq(messages.id, messageId)
    });

    if (!message || !message.previousVersions) throw new Error('Message or version not found');

    const previousVersions = [...message.previousVersions];
    previousVersions.splice(versionIndex, 1);

    return await db.update(messages)
        .set({ 
            previousVersions,
            regenerationCount: message.regenerationCount - 1
        })
        .where(eq(messages.id, messageId));
};
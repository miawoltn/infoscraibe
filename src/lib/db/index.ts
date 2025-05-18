import { NeonQueryFunction, neon } from "@neondatabase/serverless"
// import { drizzle } from "drizzle-orm/neon-http"
import { drizzle } from "drizzle-orm/postgres-js"
import { authSession, authUser, chats, creditTransactions, deletedAccounts, messages, sharedChats, userCredits, userSubscriptions } from "./schema"
import * as schema from "./schema";
import { and, eq, isNull, or, sql } from "drizzle-orm"
import postgres from 'postgres';
import { deleteFileFromS3 } from "../s3";
import { deleteNamespace } from "../pinecone";


if (!process.env.DATABASE_URL) {
    throw new Error("databse url not found")
}

// const a: NeonQueryFunction<boolean, boolean> = neon(process.env.DATABASE_URL)

export const pg = postgres(process.env.DATABASE_URL, { max: 10, idle_timeout: 20, connect_timeout: 10 })


export const db = drizzle(pg, { schema })

// const Chat = chats.

export type UserSubscription = typeof userSubscriptions.$inferSelect | typeof userSubscriptions.$inferInsert
export type Chats = typeof chats.$inferSelect | typeof chats.$inferInsert
export type Messages = typeof messages.$inferSelect | typeof messages.$inferInsert
export type AuthUser = typeof authUser.$inferSelect | typeof authUser.$inferInsert;
export type AuthSession = typeof authSession.$inferSelect | typeof authSession.$inferInsert

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
    where: eq(userSubscriptions.userId, userId)
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
    where: eq(messages.id, id)
})

export const getMessageLabels = async (id: number) => await db.query.messages.findFirst({
    where: eq(messages.id, id),
    columns: {
        regenerationLabels: true
    }
});

export const updateMessageFeedback = async (id: number, feedback: string, feedbackReason: string) => await db.update(messages).set({ feedback, feedbackReason }).where(eq(messages.id, id)).returning();


export const updateMessageWithVersion = async (id: number, content: string) => {
    const message = await db.query.messages.findFirst({
        where: eq(messages.id, id)
    });

    if (!message) throw new Error('Message not found');
    if (message.regenerationCount >= 3) throw new Error('Maximum regenerations reached');

    // Store current content in previous versions
    const previousVersions = message.previousVersions || [];
    previousVersions.push(message.content);

    const updatedMessage = await db.update(messages)
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

export const updateMessageWithVersionAndLabel = async (
    id: number,
    content: string,
    label: string
) => {
    const message = await db.query.messages.findFirst({
        where: eq(messages.id, id)
    });

    if (!message) throw new Error('Message not found');
    if (message.regenerationCount >= 3) throw new Error('Maximum regenerations reached');

    const previousVersions = message.previousVersions || [];
    const regenerationLabels = message.regenerationLabels || [];

    previousVersions.push(message.content);
    regenerationLabels.push(label);

    return await db.update(messages)
        .set({
            content,
            regenerationCount: (message.regenerationCount || 0) + 1,
            previousVersions,
            regenerationLabels
        })
        .where(eq(messages.id, id))
        .returning();
};

export const initializeUserCredits = async (userId: string) => {
    try {
        return await db.insert(userCredits)
            .values({
                userId,
                credits: '1000.00',
                reminderThreshold: '100.00'
            })
            .onConflictDoNothing() // Prevent duplicate inserts
            .returning();
    } catch (error) {
        console.error('Error initializing user credits:', error);
        throw error;
    }
};

export const addCredits = async (userId: string, amount: number, type: 'topup' | 'chat' | 'storage', metadata?: Record<string, any>) => {
    console.log({ amount, type, metadata });
    const amountStr = amount.toFixed(2);
    return await db.transaction(async (tx) => {
        const userCreditsRecord = await tx.query.userCredits.findFirst({
            where: eq(userCredits.userId, userId)
        });
        if (!userCreditsRecord) {
            await initializeUserCredits(userId);
        }
        const _userCredits = await tx
            .update(userCredits)
            .set({
                credits: sql`credits + ${amount}`,
                lastUpdated: new Date()
            })
            .where(eq(userCredits.userId, userId))
            .returning();

        await tx.insert(creditTransactions).values({
            userId,
            amount: amountStr,
            type,
            description: `Added ${amount} credits for ${type}`,
            metadata
        });

        return _userCredits[0];
    });
}

export const deductCredits = async (
    userId: string,
    amount: number,
    type: 'chat' | 'storage',
    metadata?: Record<string, any>
) => {
    const amountStr = amount.toFixed(2);
    return await db.transaction(async (tx) => {
        const _userCredits = await tx
            .update(userCredits)
            .set({
                credits: sql`credits - ${amount}`,
                lastUpdated: new Date()
            })
            .where(eq(userCredits.userId, userId))
            .returning();

        await tx.insert(creditTransactions).values({
            userId,
            amount: amount.toFixed(2),
            type,
            description: `Deducted ${amount} credits for ${type}`,
            metadata
        });

        return _userCredits[0];
    });
};


export const hasEnoughCredits = async (userId: string, requiredAmount: number) => {
    const _userCredits = await db.query.userCredits.findFirst({
        where: eq(userCredits.userId, userId)
    });

    // Convert both values to numbers for comparison
    const currentCredits = _userCredits ? parseFloat(_userCredits.credits as string) : 0;
    return currentCredits >= requiredAmount;
};

export const getUserByEmail = async (email: string) => await db.query.authUser.findFirst({
    where: eq(authUser.email, email)
});

export const getUserById = async (id: string) => await db.query.authUser.findFirst({
    where: eq(authUser.id, id)
});

export const getUserByGoogleIdOrEmail = async (googleId: string, email: string) => await db.query.authUser.findFirst({
    where: (table, { eq, or }) => or(eq(table.googleId, googleId), eq(table.email, email)),
});

export const createUser = async (user: AuthUser) => await db.insert(authUser).values(user).returning();

export const updateUser = async (id: string, user: {}) => {
    console.log({ user })
    await db
        .update(authUser)
        .set(user)
        .where(eq(authUser.id, id))
};

export async function deleteUserChats(userId: string) {
    return await db.transaction(async (tx) => {
        // 1. Get all user's chats to delete their files
        const userChats = await tx.query.chats.findMany({
            where: eq(chats.userId, userId),
            columns: {
                id: true,
                fileKey: true,
            },
        });

        // 2. Delete files from S3 and vectors from Pinecone
        await Promise.allSettled([
            ...userChats.map(chat => deleteFileFromS3(chat.fileKey)),
            ...userChats.map(chat => deleteNamespace(chat.fileKey))
        ]);

        // 3. Delete messages first (maintain referential integrity)
        for (const chat of userChats) {
            await tx.delete(messages).where(eq(messages.chatId, chat.id));
        }

        // 4. Delete all chats
        await tx.delete(chats).where(eq(chats.userId, userId));

        return userChats.length;
    });
}

export async function deleteSingleChat(chatId: number, userId: string) {
    return await db.transaction(async (tx) => {
        // 1. Get chat details and verify ownership
        const chat = await tx.query.chats.findFirst({
            where: and(
                eq(chats.id, chatId),
                eq(chats.userId, userId)
            ),
            columns: {
                fileKey: true,
            },
        });

        if (!chat) {
            throw new Error('Chat not found or unauthorized');
        }

        // 2. Delete file from S3 and vectors from Pinecone
        await Promise.allSettled([
            deleteFileFromS3(chat.fileKey),
            deleteNamespace(chat.fileKey)
        ]);

        // 3. Delete messages
        await tx.delete(messages).where(eq(messages.chatId, chatId));

        // 4. Delete chat
        await tx.delete(chats).where(eq(chats.id, chatId));

        return true;
    });
}

export async function isEmailAvailable(email: string): Promise<{
    available: boolean;
    cooldownRemaining?: number;
    message?: string;
}> {
    // Check if email exists in active users
    const existingUser = await db.query.authUser.findFirst({
        where: eq(authUser.email, email)
    });

    if (existingUser) {
        return {
            available: false,
            message: 'Email already registered'
        };
    }

    // Check if email is in cooling period
    const deletedAccount = await db.query.deletedAccounts.findFirst({
        where: eq(deletedAccounts.email, email)
    });

    if (deletedAccount) {
        const now = new Date();
        const canRegisterAfter = new Date(deletedAccount.canRegisterAfter);

        if (now < canRegisterAfter) {
            // Log failed attempts during cooldown
            console.warn(`Attempted registration of deleted email ${email} during cooldown`);
            const cooldownRemaining = Math.ceil(
                (canRegisterAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
                available: false,
                cooldownRemaining,
                message: `This email cannot be registered for ${cooldownRemaining} more days`
            };
        }

        // Log successful cooldown completion
        console.info(`Cooldown completed for ${email}, removing from deletedAccounts`);

        // If cooling period is over, delete the record
        await db.delete(deletedAccounts)
            .where(eq(deletedAccounts.email, email));
    }

    return { available: true };
}

export const getLastMessageByChatId = async (chatId: number) => await db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    orderBy: (table, { desc }) => desc(table.createdAt),
    limit: 2
}).then((messages) => {
    if (messages.length === 0) return {user: null, system: null};
    if(messages.length === 1) return {
        system: messages[0].role === 'system' ? messages[0] : null,
        user: messages[0].role === 'user' ? messages[0] : null
    };
    return {
        system: messages[0],
        user: messages[1]
    };
});

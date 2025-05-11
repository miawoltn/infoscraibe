import { db } from '@/lib/db';
import { chats, messages, userCredits, creditTransactions, authUser, deletedAccounts } from '@/lib/db/schema';
import { protectRoute, SessionManager } from '@/lib/auth/utils';
import { eq } from 'drizzle-orm';
import { deleteFileFromS3 } from '@/lib/s3';
import { NextResponse } from 'next/server';
import { deleteNamespace } from '../../../lib/pinecone';
import { logout } from '../../../lib/auth/utils/logout';
import { add } from 'date-fns';

const ACCOUNT_DELETION_COOLDOWN_DAYS = parseInt(process.env.ACCOUNT_DELETION_COOLDOWN_DAYS || '30', 10);

export const DELETE = protectRoute(async (req: Request, user) => {
  const userId = user?.id!;
  const email = user?.email!;

  try {
    // Start a transaction for atomic operations
    const fileKeys: string[] = [];
    await db.transaction(async (tx) => {
      // Add user to deleted accounts table
      console.log('adding to deleted accounts table');
      await tx.insert(deletedAccounts).values({
        email,
        userId,
        canRegisterAfter: add(new Date(), { days: ACCOUNT_DELETION_COOLDOWN_DAYS }),
        metadata: {
          lastDeletionDate: new Date().toISOString(),
          // hadSubscription: false, // You can add relevant metadata
          // hadCredits: false,
        }
      });

      console.log('deleting user data');
      // 1. Get all user's chats and files to delete from S3
      const userChats = await tx.query.chats.findMany({
        where: eq(chats.userId, userId),
        columns: {
          fileKey: true,
        },
      });

      userChats.forEach(chat => fileKeys.push(chat.fileKey));

      // console.log('deleting user transactions')
      // 3. Delete all user data in order to maintain referential integrity
      await tx.delete(creditTransactions).where(eq(creditTransactions.userId, userId));

      // Delete all user credits
      console.log('deleting user credits')
      await tx.delete(userCredits).where(eq(userCredits.userId, userId));

      // Delete all messages related to the user's chats
      console.log('deleting user messages')
      await tx.delete(messages).where(
        eq(messages.chatId, 
          db.select({ id: chats.id })
            .from(chats)
            .where(eq(chats.userId, userId))
        )
      );

      // Delete all user chats
      console.log('deleting user chats')
      await tx.delete(chats).where(eq(chats.userId, userId));

      // Delete the user account
      console.log('deleting user account')
      await tx.delete(authUser).where(eq(authUser.id, userId));

    });

    console.log('deleting user files from S3 and vectors from Pinecone');
    // 2. Delete files from S3 and vectors from Pinecone
    console.log({ fileKeys })
    if (fileKeys.length > 0) {
      await Promise.allSettled([
        ...fileKeys.map(fileKey => deleteFileFromS3(fileKey)),
        ...fileKeys.map(fileKey => deleteNamespace(fileKey)),
      ]);
    }

    // Logout user
    console.log('logging out user')
    await SessionManager.invalidateSession();

    return NextResponse.json({
      message: 'Account deleted successfully',
      canRegisterAfter: add(new Date(), { days: ACCOUNT_DELETION_COOLDOWN_DAYS })
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
});
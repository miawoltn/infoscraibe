import { db } from '@/lib/db';
import { creditTransactions, userCredits } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get user credits
        const credits = await db.query.userCredits.findFirst({
            where: eq(userCredits.userId, userId)
        });

        // Get usage history grouped by date and type
        const usageHistory = await db
            .select({
                date: sql`DATE(created_at)`,
                chatCredits: sql`SUM(CASE WHEN type = 'chat' THEN amount::numeric ELSE 0 END)`,
                storageCredits: sql`SUM(CASE WHEN type = 'storage' THEN amount::numeric ELSE 0 END)`,
            })
            .from(creditTransactions)
            .where(eq(creditTransactions.userId, userId))
            .groupBy(sql`DATE(created_at)`)
            .orderBy(sql`DATE(created_at)`)
            .limit(30); // Last 30 days

        return NextResponse.json({
            credits: credits?.credits ?? 0,
            threshold: credits?.reminderThreshold ?? 100,
            usageHistory
        });
    } catch (error) {
        console.error('Error fetching credits:', error);
        return NextResponse.json(
            { error: 'Failed to fetch credits' },
            { status: 500 }
        );
    }
}
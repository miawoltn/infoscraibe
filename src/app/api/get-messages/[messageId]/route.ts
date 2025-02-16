import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db, getMessageById, getMessageLabels } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    req: Request,
    { params }: { params: { messageId: string } }
) {
    const { userId } = auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { messageId } = params;
        
        const message = await getMessageById(+messageId);
        
        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        return NextResponse.json({
            message
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
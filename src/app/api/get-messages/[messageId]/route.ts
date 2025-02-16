import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getMessageById } from '@/lib/db';

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
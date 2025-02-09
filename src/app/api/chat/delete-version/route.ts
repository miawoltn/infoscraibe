import { NextResponse } from 'next/server';
import { deleteMessageVersion } from '@/lib/db';
import { auth } from '@clerk/nextjs';

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messageId, versionIndex } = await req.json();

        if (!messageId || typeof versionIndex !== 'number') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        await deleteMessageVersion(messageId, versionIndex);

        return NextResponse.json({ message: 'Version deleted successfully' });

    } catch (error) {
        console.error('Error deleting version:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

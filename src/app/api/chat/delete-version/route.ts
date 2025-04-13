import { NextResponse } from 'next/server';
import { deleteMessageVersion } from '@/lib/db';
import { protectRoute } from '../../../../lib/auth/utils';

export const POST = protectRoute(async (req: Request) =>{
    try {
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
})
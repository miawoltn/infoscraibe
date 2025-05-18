// route to get last message of chat
import { NextResponse } from 'next/server';
import { getLastMessageByChatId } from '@/lib/db';
import { protectRouteWithContext } from '@/lib/auth/utils';

export const GET = protectRouteWithContext( async ( req: Request, { params } ) => {
    try {
        const { fileKey } = params;
        console.log({fileKey})
        
        const { user, system } = await getLastMessageByChatId(fileKey);
        
        // if (!message) {
        //     return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        // }

        return NextResponse.json({ user, system});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
})
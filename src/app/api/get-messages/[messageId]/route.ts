import { NextResponse } from 'next/server';
import { getMessageById } from '@/lib/db';
import { protectRouteWithContext } from '../../../../lib/auth/utils';

export const GET = protectRouteWithContext( async (
    req: Request,
    { params } 
) => {
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
})
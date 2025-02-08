import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextResponse } from "next/server";
import { getSharedChatById } from "../../../../../lib/db";

export async function GET(req: Request, context: { params: Params }) {
    try {
        const sharedChatId = context.params.id;
        if (!sharedChatId) {
            return NextResponse.json({ error: 'mising identifier' }, { status: 400 });
        }
        const sharedChat = await getSharedChatById(sharedChatId);
        if(!sharedChat || new Date() > new Date(sharedChat.expiresAt!)) {
            return NextResponse.json({ error: 'Chat not found or link expired' }, { status: 404 });
        }

        return NextResponse.json({
            messages: JSON.parse(sharedChat.messages),
            createdAt: sharedChat.createdAt,
        });
    } catch (err) {
        console.error("Error fetching shared chat:", err);
        return NextResponse.json({ error: 'Something went wrong. Try again' }, { status: 500 })
    }
}
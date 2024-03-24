import { getMessagesByChatId } from "@/lib/db";
import { NextResponse } from "next/server";

export const POST = async (req: Request, res: Response)  => {
    const { chatId } = await req.json();
    const msgs = await getMessagesByChatId(chatId);
    return NextResponse.json(msgs);
}
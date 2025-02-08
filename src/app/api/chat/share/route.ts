import { db } from "@/lib/db";
import { sharedChats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { add } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, chatId } = await req.json();

    // Create a new shared chat that expires in 7 days
    const [sharedChat] = await db
      .insert(sharedChats)
      .values({
        messages: JSON.stringify(messages),
        userId,
        chatId,
        expiresAt: add(new Date(), { days: 7 }),
      })
      .returning();

    return NextResponse.json({
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/share/${sharedChat.id}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
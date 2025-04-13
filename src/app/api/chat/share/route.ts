import { db } from "@/lib/db";
import { sharedChats } from "@/lib/db/schema";
import { add } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { protectRoute } from "../../../../lib/auth/utils";

export const POST = protectRoute(async (req: Request, user) => {
  try {
    const { messages, chatId } = await req.json();

    // Create a new shared chat that expires in 7 days
    const [sharedChat] = await db
      .insert(sharedChats)
      .values({
        messages: JSON.stringify(messages),
        userId: user?.id!,
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
})
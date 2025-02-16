import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db, updateMessageFeedback } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messageId, feedback, reason } = await req.json();
    
    const updatedMessage = await updateMessageFeedback(messageId, feedback, reason);

    return NextResponse.json(updatedMessage[0]);
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
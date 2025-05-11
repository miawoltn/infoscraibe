import { NextResponse } from 'next/server';
import { updateMessageFeedback } from '@/lib/db';
import { protectRoute } from '../../../../lib/auth/utils';

export const POST = protectRoute(async (req: Request) => {
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
})
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs';
import { initialisePayment } from '../../../../lib/paystack';
import { PRICING } from '../../../../lib/constants';

export async function POST(req: Request) {
    const { userId } = auth();
    const user = await currentUser();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { amount } = await req.json();
        
        if (amount < PRICING.MIN_TOPUP_AMOUNT) {
            return NextResponse.json({ 
                error: `Minimum topup amount is ₦${PRICING.MIN_TOPUP_AMOUNT}` 
            }, { status: 400 });
        }

        const credits = amount * (1 / PRICING.CREDIT_TO_NAIRA);
        
        // Initialize Paystack transaction
        const paymentUrl = await initialisePayment({
            amount,
            email: user?.emailAddresses[0].emailAddress!,
            metadata: {
                userId,
                credits,
                type: 'topup'
            }
        });

        return NextResponse.json({ paymentUrl });
    } catch (error) {
        console.error('Topup error:', error);
        return NextResponse.json(
            { error: 'Failed to process topup' },
            { status: 500 }
        );
    }
}
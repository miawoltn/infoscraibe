import { NextResponse } from 'next/server';
import { initialisePayment } from '../../../../lib/paystack';
import { PRICING } from '../../../../lib/constants';
import { protectRoute } from "@/lib/auth/utils/protect-route";

export const POST = protectRoute(async (req, user) => {
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
            email: user?.email!,
            metadata: {
                userId: user?.id || '',
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
})
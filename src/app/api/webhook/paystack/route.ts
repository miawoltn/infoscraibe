import { headers } from "next/headers";
import crypto from 'crypto'
import { NextResponse } from "next/server";
import { addCredits, insertSubscription, updateSubscriptionBySubId } from "@/lib/db";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        console.log(body)
        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET!!)
            .update(JSON.stringify(body))
            .digest('hex');
        console.log(hash);
        if (hash !== headers().get('x-paystack-signature')) {
            return new NextResponse('Invalid signature', { status: 400 });
        }
        const event = body.event;
        const data = body.data;
        if (event === 'subscription.create') {
            await insertSubscription({
                userId: data.customer.email,
                stripeSubscriptionId: data.subscription_code,
                stripeCustomerId: data.customer.customer_code,
                stripePriceId: data.plan.plan_code,
                stripeCurrentPeriodEnd: new Date(data.next_payment_date)
            });
        }

        if (event === 'invoice.updated') {
            await updateSubscriptionBySubId(data.subscription.subscription_code, {
                stripeCurrentPeriodEnd: new Date(data.subscription.next_payment_date)
            })
        }

        if (event === 'charge.success') {
            const { metadata, amount } = data;

            console.log('adding credits...')
            // Add credits to user account
            const result = await addCredits(
                metadata.userId,
                Number(metadata.credits) || 0,
                'topup',
                {
                    transactionReference: data.reference,
                    amountPaid: (Number(amount) || 0) / 100 // Convert from kobo back to naira
                }
            );

            console.log({result});
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);
        return new NextResponse('Webhook processing failed', { status: 500 });
    }
}
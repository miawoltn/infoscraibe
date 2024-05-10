import { headers } from "next/headers";
import crypto from 'crypto'
import { NextResponse } from "next/server";
import { insertSubscription, updateSubscriptionBySubId } from "@/lib/db";

export const POST = async (req: Request) => {
    const body = await req.json();
    console.log(body)
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET!!).update(JSON.stringify(body)).digest('hex');
    console.log(hash);
    if (hash == headers().get('x-paystack-signature')) {
        const event = body.event;
        const data = body.data;
        if(event === 'subscription.create') {    
            await insertSubscription({
                userId: data.customer.email,
                stripeSubscriptionId: data.subscription_code,
                stripeCustomerId: data.customer.customer_code,
                stripePriceId: data.plan.plan_code,
                stripeCurrentPeriodEnd: new Date(data.next_payment_date)
            });
        }

        if(event.type === 'invoice.updated') {
            await updateSubscriptionBySubId(data.subscription.subscription_code, {
                stripeCurrentPeriodEnd: new Date(data.subscription.next_payment_date)
            })
        }

        return new NextResponse(null, { status: 200 });
    }

    return NextResponse.json({'status': 'error', 'message': 'Unable to process request'}, { status: 400 });
}
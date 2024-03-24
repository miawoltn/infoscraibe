import { insertSubscription, updateSubscriptionBySubId } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (req: Request) =>  {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string);

    } catch (error) {
        return new NextResponse('webhook error: ', { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if(event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        if(!session?.metadata?.userId) {
            return new NextResponse('no userid', { status: 400 });
        }

        await insertSubscription({
            userId: session.metadata.userId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
        });
    }

    if(event.type === 'invoice.payment_succeeded') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await updateSubscriptionBySubId(subscription.id, {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
        })
    }

    return new NextResponse(null, { status: 200 });
}
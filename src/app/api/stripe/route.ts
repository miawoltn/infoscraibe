import { getSubscriptionByUserId } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs"
import { NextRequest, NextResponse } from "next/server";

const return_url = process.env.NEXT_BASE_URL + '/';

export const GET = async () => {
    try {
        const { userId } = auth();
        const user = await currentUser();

        if(!userId) {
            return new NextResponse('unauthorized', { status: 401 });
        }

        const sub = await getSubscriptionByUserId(userId);
        if(sub?.stripeCustomerId) {
            // cancel billing
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: sub.stripeCustomerId,
                return_url
            });

            return NextResponse.json({ url: stripeSession.url });
        }

        // user subcribing
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: return_url,
            cancel_url: return_url,
            payment_method_types: ['card'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            customer_email: user?.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price_data: {
                        currency: 'USD',
                        product_data: {
                            name: 'ChatPDF Pro',
                            description: 'Unlimited PDF sessions'
                        },
                        unit_amount: 2000,
                        recurring: { interval: 'month'},
                    
                    },
                    quantity: 1
                }
            ],
            metadata: {
                userId
            }
        })

        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        console.log(error);
        return new NextResponse('internal server error', { status: 500 });
    }
}
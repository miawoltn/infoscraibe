import { getSubscriptionByUserId } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, protectRoute } from "../../../lib/auth/utils";

const return_url = process.env.NEXT_BASE_URL + '/';
export const dynamic = "force-dynamic"

export const GET = protectRoute( async (req, user) => {
    try {

        const sub = await getSubscriptionByUserId(user?.id!);
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
            customer_email: user?.email,
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
                userId: user?.id!
            }
        })

        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        console.log(error);
        return new NextResponse('internal server error', { status: 500 });
    }
})
import { getSubscriptionByUserId } from "@/lib/db";
import { getSubscriptionLink, initialiseSubscription } from "@/lib/paystack";
import { NextRequest, NextResponse } from "next/server";
import { protectRoute } from "../../../lib/auth/utils";

const return_url = process.env.NEXT_BASE_URL + '/';
export const dynamic = "force-dynamic";

export const GET = protectRoute( async (req, user) => {
    try {
        const userId = user?.id!;

        const sub = await getSubscriptionByUserId(userId);
        if (sub?.stripeCustomerId) {
            // generate subscription link for user to manage
            // their subscription
            const subscriptionLink = await getSubscriptionLink({ subscriptionCode: sub.stripeSubscriptionId || '' });

            return NextResponse.json({ url: subscriptionLink });
        }

        // user subcribing
        const subscriptionUrl = await initialiseSubscription({ userId: userId, email: user?.email! });

        return NextResponse.json({ url: subscriptionUrl });
    } catch (error) {
        console.log(error);
        return new NextResponse('internal server error', { status: 500 });
    }
})
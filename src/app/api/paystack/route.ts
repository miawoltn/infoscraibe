import { getSubscriptionByUserId } from "@/lib/db";
import { getSubscriptionLink, initialiseSubscription } from "@/lib/paystack";
import { auth, currentUser } from "@clerk/nextjs"
import { NextRequest, NextResponse } from "next/server";

const return_url = process.env.NEXT_BASE_URL + '/';
export const dynamic = "force-dynamic";

export const GET = async () => {
    try {
        // const { userId } = auth();
        const user = await currentUser();
        const userId = user?.emailAddresses[0].emailAddress;

        console.log(userId);

        if (!userId) {
            return new NextResponse('unauthorized', { status: 401 });
        }

        const sub = await getSubscriptionByUserId(userId);
        if (sub?.stripeCustomerId) {
            // generate subscription link for user to manage
            // their subscription
            const subscriptionLink = await getSubscriptionLink({ subscriptionCode: sub.stripeSubscriptionId || '' });

            return NextResponse.json({ url: subscriptionLink });
        }

        // user subcribing
        const subscriptionUrl = await initialiseSubscription({ userId: userId, email: user?.emailAddresses[0].emailAddress!! })

        return NextResponse.json({ url: subscriptionUrl });
    } catch (error) {
        console.log(error);
        return new NextResponse('internal server error', { status: 500 });
    }
}
import { auth } from "@clerk/nextjs";
import { getSubscriptionByUserId } from "./db";

export const checkSubscription = async () => {
    const { userId } = auth();
    if(!userId) return false;

    const subscription = await getSubscriptionByUserId(userId);
    if(!subscription) return false;

    const isValid = subscription.stripePriceId && subscription.stripeCurrentPeriodEnd?.getTime()! + 60 * 60 * 24 * 1000 > Date.now();
    return !!isValid;
}
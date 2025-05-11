import { getCurrentUser } from "./auth/utils";
import { getSubscriptionByUserId } from "./db";

export const checkSubscription = async () => {
    const user = await getCurrentUser();
    if(!user) return false;

    const subscription = await getSubscriptionByUserId(user?.id);
    if(!subscription) return false;

    const isValid = subscription.stripePriceId && subscription.stripeCurrentPeriodEnd?.getTime()! + 60 * 60 * 24 * 1000 > Date.now();
    return !!isValid;
}
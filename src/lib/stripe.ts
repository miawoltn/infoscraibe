import { PLANS } from '@/config/pricing';
import Stripe from 'stripe'
import { db, getSubscriptionByUserId } from './db';
import { getSubscription } from './paystack';
import { validateRequest } from './auth/utils/validate-request';

export const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
    apiVersion: '2023-10-16',
    typescript: true
});

export async function getUserSubscriptionPlan() {
     const { user } = await validateRequest();
      const userId = user?.id!;
      const isAuth = !!userId;

    if (!userId) {
      return {
        plan: PLANS[0],
        isSubscribed: false,
        isCanceled: false,
        stripeCurrentPeriodEnd: null,
        stripeSubscriptionId: null
      }
    }
  
    const dbUser = await getSubscriptionByUserId(userId)
  
    if (!dbUser) {
      return {
        plan: PLANS[0],
        isSubscribed: false,
        isCanceled: false,
        stripeCurrentPeriodEnd: null,
        stripeSubscriptionId: null
      }
    }
  
    const isSubscribed = Boolean(
      dbUser.stripePriceId &&
        dbUser.stripeCurrentPeriodEnd && // 86400000 = 1 day
        dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
    )
  
    const plan = isSubscribed
      ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
      : null
  
    let isCanceled = false
    if (isSubscribed && dbUser.stripeSubscriptionId) {
      const stripePlan = await getSubscription({subscriptionCode: dbUser.stripeSubscriptionId})
      // await stripe.subscriptions.retrieve(
      //   dbUser.stripeSubscriptionId
      // )
      isCanceled = stripePlan.cancelledAt; //cancel_at_period_end
    }
  
    return {
      plan: plan,
      stripeSubscriptionId: dbUser.stripeSubscriptionId,
      stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
      stripeCustomerId: dbUser.stripeCustomerId,
      isSubscribed,
      isCanceled,
    }
  }
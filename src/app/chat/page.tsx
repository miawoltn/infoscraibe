import Dashboard from '@/components/Dashboard'
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { getUserSubscriptionPlan } from '@/lib/stripe';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {}

async function ChatsPage({}: Props) {
    const { userId } = auth();
    if (!userId) return redirect('/sign-in');

    const subscriptionPlan = await getUserSubscriptionPlan()
  return (
    <MaxWidthWrapper className='mb-12 mt-10 sm:mt-20 flex flex-col items-center justify-center text-center'>
     <Dashboard subscriptionPlan={subscriptionPlan} />
     </MaxWidthWrapper>
  )
}

export default ChatsPage
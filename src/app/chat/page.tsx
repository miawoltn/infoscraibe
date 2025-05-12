import Dashboard from '@/components/Dashboard'
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { getUserSubscriptionPlan } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import React from 'react'
import { validateRequest } from '../../lib/auth/utils/validate-request';
import { withAuth } from '../../lib/auth/utils/with-auth';
import { getCurrentUser } from '../../lib/auth/utils';

type Props = {}

async function ChatsPage() {
     const user = await getCurrentUser();
      const userId = user?.id!;
    if (!userId) return redirect('/sign-in');

  return (
    <MaxWidthWrapper className='mb-12 mt-10 sm:mt-20 flex flex-col items-center justify-center text-center'>
     <Dashboard />
     </MaxWidthWrapper>
  )
}

export default withAuth(ChatsPage)
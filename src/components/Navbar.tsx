import Link from 'next/link'
import MaxWidthWrapper from './MaxWidthWrapper'
import { Button, buttonVariants } from './ui/button'
import { ArrowRight, LogIn } from 'lucide-react'
import MobileNav from './MobileNav'
import { UserButton, auth, SignInButton, SignOutButton, currentUser, RedirectToUserProfile, UserProfile } from '@clerk/nextjs'
import { Icons } from './Icons'
import UserAccountNav from './UserAccountNav'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import ThemeSwitcher from './theme/Switcher'

const Navbar = async () => {
  const { userId } = auth();
  const user = await currentUser();
  const isAuth = !!userId;

  const subscriptionPlan = await getUserSubscriptionPlan()


  return (
    <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 dark:border-gray-700 bg-white/75 dark:bg-transparent backdrop-blur-lg transition-all'>
      <MaxWidthWrapper>
        <div className='flex h-14 items-center justify-between border-b border-zinc-200 dark:border-gray-700'>
          <Link
            href='/'
            className='flex z-40 font-semibold text-xl'>
              <Icons.logo className='fill-black-200 dark:fill-white text-black-200 dark:text-white h-8 w-8' />
            <span>InfoScr<strong className='underline'>ai</strong>be</span>
          </Link>

          <MobileNav user={{firstName: user?.firstName, lastName: user?.lastName, email: user?.emailAddresses[0].emailAddress, imageUrl: user?.imageUrl}} isAuth={isAuth} subscriptionPlan={subscriptionPlan} />

          <div className='hidden items-center space-x-4 sm:flex'>
            {!isAuth ? (
              <>
                <Link
                  href='/pricing'
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}>
                  Pricing
                </Link>
                <Link href='sign-in'>
                <Button className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}>
                    Sign In <LogIn className="w-4 h-4 ml-2" />
                </Button>
                </Link>
              </>
            ) : (
              <>
                {/* <Link
                  href='/dashboard'
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}>
                  Dashboard
                </Link> */}

                <UserAccountNav
                  name={
                    !user?.firstName || !user.lastName || !user.username
                      ? 'Your Account'
                      : `${user.firstName} ${user.lastName}`
                  }
                  email={user?.emailAddresses[0].emailAddress ?? ''}
                  imageUrl={user?.imageUrl ?? ''}
                  subscriptionPlan={subscriptionPlan}
                />              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}

export default Navbar
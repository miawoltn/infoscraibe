import Link from 'next/link'
import MaxWidthWrapper from './MaxWidthWrapper'
import { Button, buttonVariants } from './ui/button'
import { LogIn } from 'lucide-react'
import { Icons } from './Icons'
import UserAccountNav from './UserAccountNav'
import dynamic from 'next/dynamic'
import { validateRequest } from '../lib/auth/utils/validate-request'

const Navbar = async () => {
  const { user } = await validateRequest();
  const userId = user?.id!;
  const isAuth = !!userId;

  return (
    <nav className='h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 dark:border-gray-700 bg-white/75 dark:bg-transparent backdrop-blur-lg transition-all'>
      <MaxWidthWrapper>
        <div className='flex h-14 items-center justify-between border-b border-zinc-200 dark:border-gray-700'>
          <Link
            href='/'
            className='flex z-40 font-semibold text-xl'>
              <Icons.logo className='fill-black-200 dark:fill-white text-black-200 dark:text-white h-8 w-8' />
            <span>InfoScr<strong className='underline'>ai</strong>be</span>
          </Link>

          {/* <MobileNav user={{ name: user?.name, email: user?.email, imageUrl: user?.imageUrl}} isAuth={isAuth} /> */}

          <div className=' items-center space-x-4 sm:flex'>
            {!isAuth ? (
              <>
                {/* <Link
                  href='/pricing'
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}>
                  Pricing
                </Link> */}
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
                    !user?.name
                      ? 'Your Account'
                      : `${user.name}`
                  }
                  email={user?.email?? ''}
                  imageUrl={user?.imageUrl ?? ''}
                  emailVerified={user?.emailVerified ?? false}
                />
                </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}

export default Navbar
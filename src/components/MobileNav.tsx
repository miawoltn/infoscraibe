'use client'

import { ArrowRight, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const MobileNav = ({ isAuth, user }: { isAuth: boolean, user: any }) => {
  const [isOpen, setOpen] = useState<boolean>(false)
  const toggleOpen = () => setOpen((prev) => !prev)
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) toggleOpen()
  }, [pathname, isOpen])

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen()
    }
  }

  const UserAccountNav = dynamic(() => import("./UserAccountNav"), {
    ssr: true,
    loading: () => <p>Loading...</p>,
  });

  const MenuIfSignedIn = () => {
    return (
      <UserAccountNav
      name={
        !user?.name
          ? 'Your Account'
          : `${user.name}`
      }
      email={user?.email?? ''}
      imageUrl={user?.imageUrl ?? ''}
    />
    )
  }

  const MenuIfSignedOut = () => {
    return (
      <>
        <Menu
          onClick={toggleOpen}
          className='relative z-50 h-5 w-5 text-zinc-700 dark:text-zinc-200'
        />

        {isOpen ? (
          <div className='fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full'>
            <ul className='absolute bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-zinc-800 shadow-xl grid w-full gap-1 px-10 pt-20 pb-8'>
              <li>
                <Link
                  onClick={() =>
                    closeOnCurrent('/sign-up')
                  }
                  className='flex items-center w-full font-semibold text-green-600'
                  href='/sign-up'>
                  Get started
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Link>
              </li>
              <li className='my-3 h-px w-full bg-gray-300' />
              <li>
                <Link
                  onClick={() =>
                    closeOnCurrent('/sign-in')
                  }
                  className='flex items-center w-full font-semibold'
                  href='/sign-in'>
                  Sign in
                </Link>
              </li>
              <li className='my-3 h-px w-full bg-gray-300' />
              <li>
                <Link
                  onClick={() =>
                    closeOnCurrent('/pricing')
                  }
                  className='flex items-center w-full font-semibold'
                  href='/pricing'>
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        ) : null}
      </>)
  }

  return (
    <div className='sm:hidden'>
      {isAuth ? <MenuIfSignedIn /> : <MenuIfSignedOut />}
    </div>
  )
}

export default MobileNav
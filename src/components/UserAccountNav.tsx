// import { getUserSubscriptionPlan } from '@/lib/stripe'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

import { Avatar, AvatarFallback } from './ui/avatar'
import Image from 'next/image'
import { Icons } from './Icons'
import Link from 'next/link'
import { Gem, LayoutDashboard, LogOut, Podcast, Settings, User } from 'lucide-react'
import { Button } from './ui/button'
import { SignOutButton } from '@clerk/nextjs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import ThemeSwitcher from './theme/Switcher'


interface UserAccountNavProps {
  email: string | undefined
  name: string
  imageUrl: string,
  subscriptionPlan: any
}

const UserAccountNav = async ({
  email,
  imageUrl,
  name,
  subscriptionPlan
}: UserAccountNavProps) => {

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className='overflow-visible'>
          <Button className='rounded-full h-8 w-8 aspect-square bg-slate-400 dark:bg-slate-900'>
            <Avatar className='relative w-8 h-8'>
              {imageUrl ? (
                <div className='relative aspect-square h-full w-full'>
                  <Image
                    fill
                    src={imageUrl}
                    alt='profile picture'
                    referrerPolicy='no-referrer'
                  />
                </div>
              ) : (
                <AvatarFallback>
                  <span className='sr-only'>{name}</span>
                  <Icons.user className='h-4 w-4 text-zinc-900 dark:text-zinc-200' />
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='bg-white dark:bg-black' align='end'>
          <div className='flex items-center justify-start gap-3 p-2'>
            <div className='flex flex-col space-y-0.5 leading-none'>
              {name && (
                <p className='font-medium text-sm text-black dark:text-white'>
                  {name}
                </p>
              )}
              {email && (
                <p className='w-[200px] truncate text-xs text-zinc-700 dark:text-zinc-300'>
                  {email}
                </p>
              )}
            </div>
          </div>

          {/* <DropdownMenuSeparator /> */}

          <DropdownMenuItem asChild>
            <Link className='cursor-pointer' href='/dashboard'>
              <LayoutDashboard className='h-4 w-4 ml-1 mr-2' />
              Dashboard
            </Link>
          </DropdownMenuItem>

          {/* <DropdownMenuSeparator /> */}

          <DropdownMenuItem asChild>
            {subscriptionPlan?.isSubscribed ? (
              <Link className='cursor-pointer' href='/billing'>
                <Podcast className='h-4 w-4 ml-1 mr-2' />
                Manage Subscription
              </Link>
            ) : (
              <Link className='cursor-pointer' href='/pricing'>
                <Gem className='h-4 w-4 ml-1 mr-2' />
                Upgrade{' '}
              </Link>
            )}
          </DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem asChild>
              <Link className='cursor-pointer' href={''}>
                <Settings className='h-4 w-4 ml-1 mr-2' />
                Settings
              </Link>
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuSeparator />

          <DropdownMenuItem className='cursor-pointer'>
            <SignOutButton>
              <Link className='cursor-pointer' href={''}>
                <LogOut className='h-4 w-4 ml-1 mr-2' /> <span>Log out</span>
              </Link>
            </SignOutButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Separator className="my-4" />
        <div className='flex flex-row items-center justify-between w-full'>
          <Label>Theme</Label>
          <ThemeSwitcher />
        </div>
        {/* <Tabs defaultValue="general" orientation='vertical' className='flex-col gap-6 items-start'>
          <TabsList className='flex flex-col flex-shrink gap-2'>
            <TabsTrigger className='border-0' value="general">
              <Settings className="w-4 h-4 ml-2" /> {' '} General
            </TabsTrigger>
            <TabsTrigger className='border-0' value="account">
              <User className="w-4 h-4 ml-2"/>  Account
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general">
          <ThemeSwitcher />
          </TabsContent>
          <TabsContent value="account">
            Account settings goes here
          </TabsContent>
        </Tabs> */}
      </DialogContent>
    </Dialog>
  )
}

export default UserAccountNav
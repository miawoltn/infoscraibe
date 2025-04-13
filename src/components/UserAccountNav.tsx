
'use client'
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
import { AlertTriangle, CreditCard, Gem, LayoutDashboard, LogOut, LogOutIcon, Podcast, Settings, User } from 'lucide-react'
import { Button } from './ui/button'
// import { SignOutButton } from '@clerk/nextjs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import ThemeSwitcher from './theme/Switcher'
import { logout } from '../lib/auth/utils/logout'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import SignoutConfirmation from './SignoutConfirmation'


interface UserAccountNavProps {
  email: string | undefined
  name: string
  imageUrl: string
}

const UserAccountNav = ({
  email,
  imageUrl,
  name,
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

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link className='cursor-pointer' href='/dashboard'>
              <LayoutDashboard className='h-4 w-4 ml-1 mr-2' />
              Dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
          <Link className='cursor-pointer' href="/credit">
            <CreditCard className="h-4 w-4 ml-1 mr-2" />
            Credits & Usage
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

          {/* <DropdownMenuSeparator /> */}

          <DialogTrigger asChild>
            <DropdownMenuItem asChild>
              <Link className='cursor-pointer' href={''}>
                <Settings className='h-4 w-4 ml-1 mr-2' />
                Settings
              </Link>
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuSeparator />

          <DialogTrigger asChild>
            <DropdownMenuItem asChild>
              <Link className='cursor-pointer' href={''}>
                <LogOutIcon className='h-4 w-4 ml-1 mr-2' />
                Signout
              </Link>
            </DropdownMenuItem>
          </DialogTrigger>

          {/* <DropdownMenuItem>
            <SignoutConfirmation />
          </DropdownMenuItem>*/}
        </DropdownMenuContent> 
      </DropdownMenu>

       {/* S E T T I N G S  D I A L O G */}
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
      
       {/* S I G N O U T  D I A L O G */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign out?</DialogTitle>
        </DialogHeader>
        <DialogDescription>You will be redirected to the home page.</DialogDescription>
         <SignoutConfirmation />
      </DialogContent>
    </Dialog>
  )
}

export default UserAccountNav




// 'use client';

// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { useRouter } from "next/navigation";
// import { LayoutDashboard, Link, Loader2, LogOut, Settings } from "lucide-react";
// import { useState } from "react";
// import { Button } from "./ui/button";

// interface UserAccountNavProps {
//   // user: {
//       name: string | null;
//       email: string;
//       imageUrl: string | null;
//       subscriptionPlan?: any;
//       onLogout: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
//   // };
// }

// export default function UserAccountNav({ name, email, imageUrl, onLogout }: UserAccountNavProps) {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSignOut = async () => {
//       try {
//           setIsLoading(true);
//           const response = await fetch('/api/auth/logout', {
//               method: 'POST',
//           });

//           if (!response.ok) {
//               throw new Error('Failed to sign out');
//           }

//           router.push('/sign-in');
//           router.refresh();
//       } catch (error) {
//           console.error('Sign out error:', error);
//       } finally {
//           setIsLoading(false);
//       }
//   };

//   return (
//       <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//                   <Avatar>
//                       <AvatarImage src={imageUrl ?? undefined} />
//                       <AvatarFallback>{name ?? email}</AvatarFallback>
//                   </Avatar>
//               </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//               <DropdownMenuLabel>
//                   <div className="flex flex-col space-y-1">
//                       <p className="text-sm font-medium">{name}</p>
//                       <p className="text-xs text-muted-foreground">{email}</p>
//                   </div>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem asChild>
//                   <Link href="/dashboard">
//                       <LayoutDashboard className="mr-2 h-4 w-4" />
//                       Dashboard
//                   </Link>
//               </DropdownMenuItem>
//               <DropdownMenuItem asChild>
//                   <Link href="/settings">
//                       <Settings className="mr-2 h-4 w-4" />
//                       Settings
//                   </Link>
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem 
//                 //   onClick={() => {}}
//                 //   disabled={isLoading}
//                   className="text-red-600 focus:text-red-600"
//               >
//                   {/* {isLoading ? (
//                       <>
//                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                           Signing out...
//                       </>
//                   ) : ( */}
//                       <>
//                           {/* <LogOut className="mr-2 h-4 w-4" /> */}
//                           Sign out
//                       </>
//                   {/* )} */}
//               </DropdownMenuItem>
//           </DropdownMenuContent>
//       </DropdownMenu>
//   );
// }
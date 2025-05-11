
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
import { AlertCircleIcon, AlertTriangle, CreditCard, Gem, Info, LayoutDashboard, LogOut, LogOutIcon, Podcast, Settings, User } from 'lucide-react'
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
import { ScrollArea } from './ui/scroll-area'
import { APP_TITLE } from '../lib/constants'
import { cn } from '../lib/utils'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { DangerZone } from './DangerZone'


interface UserAccountNavProps {
  email: string | undefined
  name: string
  imageUrl: string
  emailVerified?: boolean
}

const UserAccountNav = ({
  email,
  imageUrl,
  name,
  emailVerified
}: UserAccountNavProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSignoutOpen, setIsSignoutOpen] = useState(false)

  return (
    <>
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
          {/* <DropdownMenuSeparator /> */}


          {/* <DialogTrigger asChild> */}
          <DropdownMenuItem asChild onClick={() => setIsSettingsOpen(true)}>
            <div className='cursor-pointer' >
              <Settings className='h-4 w-4 ml-1 mr-2' />
              Settings
            </div>
          </DropdownMenuItem>
          {/* </DialogTrigger> */}
          {/* <DropdownMenuSeparator /> */}
          {/* <DropdownMenuItem asChild>
            <Link className='cursor-pointer' href='/privacy'>
              <Podcast className='h-4 w-4 ml-1 mr-2' />
              Privacy Policy
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link className='cursor-pointer' href='/terms'>
              <AlertTriangle className='h-4 w-4 ml-1 mr-2' />
              Terms of Service
            </Link>
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          {/* <DialogTrigger asChild> */}
          <DropdownMenuItem asChild onClick={() => setIsSignoutOpen(true)}>
            <div className='cursor-pointer' >
              <LogOutIcon className='h-4 w-4 ml-1 mr-2' />
              Signout
            </div>
          </DropdownMenuItem>
          {/* </DialogTrigger> */}

          {/* <DropdownMenuItem>
            <SignoutConfirmation />
          </DropdownMenuItem>*/}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* TODO: finish work on the settings dialog */}
      {/* S E T T I N G S  D I A L O G */}

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent aria-describedby={undefined} className="w-full max-w-3xl max-h-[70vh] overflow-hidden">
          <DialogTitle className='hidden'></DialogTitle>
          <Tabs defaultValue="general" className="flex flex-col md:flex-row h-full">

            {/* Sidebar for Desktop */}
            <div className="hidden md:flex w-[25%] border-r border-border pr-2 flex-shrink-0">
              <div className="w-full">
                <div className="px-2 py-4">
                  <h2 className="text-lg font-semibold mb-2">Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage your account preferences</p>
                </div>
                <TabsList className="flex flex-col gap-1 bg-transparent p-0 mt-10">
                  <TabsTrigger value="general" className="w-full justify-start px-2 py-2 h-9 font-normal focus:bg-accent hover:bg-accent">
                    <Settings className="w-4 h-4 mr-2" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="w-full justify-start px-2 py-2 h-9 font-normal hover:bg-accent">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="about" className="w-full justify-start px-2 py-2 h-9 font-normal hover:bg-accent">
                    <AlertCircleIcon className="w-4 h-4 mr-2" />
                    About
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Mobile Tabs Header */}
            <div className="md:hidden flex-shrink-0 flex-wrap md:ms-[-8px] md:min-w-[180px] mt-5 px-0 pt-0 sticky top-0 bg-background z-10 border-b border-border">
              <TabsList className="flex w-full justify-between">
                <TabsTrigger value="general" className="flex-1">
                  <Settings className="w-4 h-4 mx-auto" />
                  <span className="text-xs block mt-1">General</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex-1">
                  <User className="w-4 h-4 mx-auto" />
                  <span className="text-xs block mt-1">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="about" className="flex-1">
                  <Info className="w-4 h-4 mx-auto" />
                  <span className="text-xs block mt-1">About</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(70vh-4rem)] px-4 md:px-6 py-6 no-scrollbar">
                <TabsContent value="general">
                  <h3 className="text-base font-medium mb-4">General Settings</h3>
                  <div className="space-y-6">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Theme</Label>
                          <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                        </div>
                        <ThemeSwitcher />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Language</Label>
                          <p className="text-sm text-muted-foreground">Select your language</p>
                        </div>
                        <Select defaultValue="en">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">AI Model</Label>
                          <p className="text-sm text-muted-foreground">Choose the AI model for responses</p>
                        </div>
                        <Select defaultValue="gpt-3.5">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="profile">
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  <div className="space-y-6">
                    <Card className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Name</Label>
                            <p className="text-sm text-muted-foreground">{name}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Email</Label>
                            <p className="text-sm text-muted-foreground">{email}</p>
                          </div>
                          <Badge variant={emailVerified ? "success" : "warning"}>
                            {emailVerified ? "Verified" : "Not Verified"}
                          </Badge>
                        </div>
                      </div>
                    </Card>


                    <DangerZone shouldCloseParentDialog={(value: boolean) => setIsSettingsOpen(!value)} />
                    {/* <Card className="p-4 border-destructive">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-base font-medium text-destructive mb-2">Danger Zone</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Permanent actions that cannot be undone
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Button variant="destructive" className="w-full" onClick={() => toast.success("All chats deleted successfully")}>
                            Delete All Chats
                          </Button>
                          <Button variant="destructive" className="w-full" onClick={() => toast.success("Account deleted successfully")}>
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </Card> */}
                  </div>
                </TabsContent>

                <TabsContent value="about">
                  <h3 className="text-lg font-semibold mb-4">About {APP_TITLE}</h3>
                  <div className="space-y-6">
                    <Card className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base">Version</Label>
                          <p className="text-sm text-muted-foreground">1.0.0</p>
                        </div>
                        <div>
                          <Label className="text-base">Legal</Label>
                          <div className="space-y-2 mt-2">
                            <Button variant="link" asChild className="h-auto p-0">
                              <Link href="/privacy">Privacy Policy</Link>
                            </Button>
                            <Button variant="link" asChild className="h-auto p-0">
                              <Link href="/terms">Terms of Service</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>


      {/* S I G N O U T  D I A L O G */}
      <Dialog open={isSignoutOpen} onOpenChange={setIsSignoutOpen}>
        <DialogContent className="sm:max-w-[425px]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
          </DialogHeader>
          <DialogDescription>You will be redirected to the home page.</DialogDescription>
          <SignoutConfirmation onCancel={setIsSignoutOpen} />
        </DialogContent>
      </Dialog>
    </>
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
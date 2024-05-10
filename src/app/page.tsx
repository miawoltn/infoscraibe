import FileUpload from "@/components/FileUpload";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import SubscriptionButton from "@/components/SubscriptionButton";
import Typewriter from "@/components/Typewriter";
import { Button, buttonVariants } from "@/components/ui/button";
import { getChatById, getChatByUserId } from "@/lib/db";
import { checkSubscription } from "@/lib/subscription";
import { UserButton, auth, UserProfile } from "@clerk/nextjs";
import { ArrowRight, ArrowRightIcon, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  const isPro = await checkSubscription();
  let firstChat;
  if(userId) {
    firstChat = await getChatByUserId(userId);
  }
  return (
     <>
      <MaxWidthWrapper className='mb-12 mt-10 sm:mt-20 flex flex-col items-center justify-center text-center'>
        <h1 className='max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl'>
          <Typewriter text="Easily converse with your documents in seconds." />
        </h1>
        <p className='mt-5 max-w-prose text-zinc-500 sm:text-lg'>
        With InfoScribe, chat directly with any PDF. Upload your file and start asking questions instantly.
        </p>

        <Link
          className={buttonVariants({
            size: 'lg',
            className: 'mt-5',
          })}
          href='/dashboard'
          target='_blank'>
          Get started{' '}
          <ArrowRight className='ml-2 h-5 w-5' />
        </Link>
      </MaxWidthWrapper>
      
    </>
    // <div className="w-screen min-h-screen bg-gradient-to-b from-sky-400 to-sky-200">
    //   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    //     <div className="flex flex-col items-center text-center">
    //       <div className="flex items-center">
    //         <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
    //         <UserButton afterSignOutUrl="/" />
    //       </div>

    //       <div className="flex mt-2">
    //         {isAuth && firstChat && <Link href={`chat/${firstChat.id}`}>
    //         <Button>Got to Chats <ArrowRightIcon className="ml-2"/></Button> </Link>}

            
    //         <div className="ml-3">
    //           <SubscriptionButton isPro={isPro} />
    //         </div>
    //       </div>

    //       <p className="max-w-xl mt-1 text-lg text-slate-600">
    //         Join millions of students, researchers and professionals to instantly
    //         answer questions and understand research with AI
    //       </p>

    //       <div className="w-full">
    //         {isAuth ? (<FileUpload />) :
    //           (<Link href="/sign-in">
    //             <Button> Login to get started
    //             <LogIn className="w-4 h-4 ml-2" />
    //             </Button>
    //           </Link>)}
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}

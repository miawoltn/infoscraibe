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
      <MaxWidthWrapper className='mb-12 mt-10 sm:mt-40 flex flex-col items-center justify-center text-center'>
        <h1 className='max-w-4xl text-2xl font-bold md:text-6xl lg:text-7xl'>
          <Typewriter text="Access information in your documents in seconds." />
        </h1>
        <p className='mt-5 max-w-prose text-zinc-500 sm:text-lg'>
        With InfoScrybe, chat directly with any PDF. Upload your file and start asking questions instantly.
        </p>

        <Link
          className={buttonVariants({
            size: 'lg',
            className: 'mt-5',
          })}
          href='/dashboard'>
          Get started{' '}
          <ArrowRight className='ml-2 h-5 w-5' />
        </Link>
      </MaxWidthWrapper>
    </>
  );
}

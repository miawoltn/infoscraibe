'use client'
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { SignIn, ClerkLoaded, ClerkLoading, useSignIn, useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function Page() {
  const {isLoaded} = useSignIn();
  useEffect(() => {
    let timer = null;
    if(isLoaded) {
    timer = setTimeout(() => { 
    const clerkBanner = document.querySelector<HTMLElement>('.cl-internal-b3fm6y')!;
      if (clerkBanner) {
        clerkBanner.parentElement?.removeChild(clerkBanner);
      }
    }, 20)
    }

    return () => clearInterval(timer!);
  }, [isLoaded])
  
  return (
    <MaxWidthWrapper className='mb-12 mt-10 sm:mt-20 flex flex-col items-center justify-center text-center'>
    {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"> */}
      {isLoaded ? <SignIn /> : <Loader2 className="animate-spin items-center mt-20 w-10 h-10" />}
    {/* </div> */}
    </MaxWidthWrapper>
  );
}
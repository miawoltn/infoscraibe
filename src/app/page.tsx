// 'use client'
import FileUpload from "@/components/FileUpload";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Typewriter from "@/components/Typewriter";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, ArrowRightIcon, CheckCircle, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { validateRequest } from "../lib/auth/utils/validate-request";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";

export default async function Home() {
  const { session } = await validateRequest();
  const isAuth = !!session?.userId;

  if (isAuth) {
    return redirect('/dashboard')
  }
  return (
    <Suspense>
      <ScrollArea className="h-[calc(100vh-2rem)] mt-10">
        <MaxWidthWrapper className='mb-12 mt-10 sm:md:mt-40 flex flex-col items-center justify-center text-center overflow-auto'>
          <div className="space-y-4 w-full max-w-4xl mx-auto">
            <h1 className='max-w-4xl text-xl font-bold md:text-4xl lg:text-6xl text-center'>
              <Typewriter text="Chat with your documents instantly" />
            </h1>
            <p className='mt-5 mx-auto text-zinc-500 dark:text-zinc-200 sm:text-base text-center max-w-2xl'>
              Upload your documents and get instant answers to your questions.
              Get free credits when you sign up.
            </p>

            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Free credits on signup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Pay as you go</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">No subscription</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-5">
              <Link
                className={buttonVariants({
                  size: 'lg',
                })}
                href='/dashboard'>
                Start for free{' '}
                <ArrowRight className='ml-2 h-5 w-5' />
              </Link>
              <Link
                className={buttonVariants({
                  size: 'lg',
                  variant: 'outline'
                })}
                href='#features'>
                See how it works
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="secondary">PDF files</Badge>
              <Badge variant="secondary">Word documents</Badge>
            </div>
          </div>
        </MaxWidthWrapper>

        {/* value proposition section */}
        <div>
          <div className='relative isolate'>
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'>
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]'
              />
            </div>

            <div>
              <div className='mx-auto max-w-6xl px-6 lg:px-8'>
                <div className='mt-16 flow-root sm:mt-24'>
                  <div className='-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4'>
                    <Image
                      src='/product_preview.png'
                      alt='product preview'
                      width={1364}
                      height={866}
                      quality={100}
                      className='rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10'
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'>
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className='relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]'
              />
            </div>
          </div>
        </div>

        {/* Feature section */}
        <div id="features" className='mx-auto mb-32 mt-5 max-w-5xl sm:mt-56'>
          <div className='mb-12 px-6 lg:px-8'>
            <div className='mx-auto max-w-2xl sm:text-center'>
              <h2 className='mt-2 font-bold text-4xl text-gray-900 dark:text-gray-200 sm:text-5xl'>
                Start chatting in minutes
              </h2>
              <p className='mt-4 text-lg text-gray-600 dark:text-gray-300'>
                Top up credits as you need. No monthly commitments or subscriptions required.
              </p>
            </div>
          </div>

          {/* steps */}
          <ol className='my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0'>
            <li className='md:flex-1'>
              <div className='flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4'>
                <span className='text-sm font-medium text-blue-600'>
                  Step 1
                </span>
                <span className='text-xl font-semibold'>
                  Sign up for free
                </span>
                <span className='mt-2 text-zinc-700 dark:text-zinc-500'>
                  Get started with free credits to try out the service
                </span>
              </div>
            </li>
            <li className='md:flex-1'>
              <div className='flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4'>
                <span className='text-sm font-medium text-blue-600'>
                  Step 2
                </span>
                <span className='text-xl font-semibold'>
                  Upload your document
                </span>
                <span className='mt-2 text-zinc-700 dark:text-zinc-500'>
                  Upload PDF or Word documents. We'll process it instantly.
                </span>
              </div>
            </li>
            <li className='md:flex-1'>
              <div className='flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4'>
                <span className='text-sm font-medium text-blue-600'>
                  Step 3
                </span>
                <span className='text-xl font-semibold'>
                  Start chatting
                </span>
                <span className='mt-2 text-zinc-700 dark:text-zinc-500'>
                  Top up credits anytime to continue using the service
                </span>
              </div>
            </li>
          </ol>
        </div>
      </ScrollArea>
    </Suspense>
  );
}

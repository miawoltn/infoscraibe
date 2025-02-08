
'use client'
import ChatComponent from '@/components/ChatComponent';
import ChatSideBar from '@/components/ChatSideBar';
import PDFViewer from '@/components/PDFViewer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { db, getChatByUserIdAndChatId, getChatByUserIdAndChecksum } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { checkSubscription } from '@/lib/subscription';
import { auth, currentUser, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {
    params: {
        chatId: string;
    }
}

const ChatPage =  ({ params: { chatId } }: Props) => {
    const [id, checksum] = decodeURIComponent(chatId).split(':')
    const { data, isLoading, isError } = useQuery({
        queryKey: ['checksum', checksum],
        queryFn: async () => {
          const response = await axios.get(`/api/chat/${checksum}`);
          console.log(response.data)
          return response.data;
        },
        // staleTime: Infinity
    })

    const { isSignedIn, isLoaded } = useUser();
    // if(!isLoaded) {
    //     return <Skeleton className='m-5 h-60 w-full' />
    // }

    if(!isSignedIn) {
        return redirect('/sign-in'); 
    }

    if(isLoading || !isLoaded) {
        return (
            <div className='flex flex-col md:flex-row'>
                {/* PDF Viewer Skeleton */}
                <div className='w-full md:w-1/3 lg:md:h-screen h-2/3'>
                    <div className='px-0 pt-5 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                        <Skeleton className='h-[calc(100vh-2rem)] w-full rounded-lg' />
                    </div>
                </div>
    
                {/* Chat Component Skeleton */}
                <div className='w-full md:w-2/3 border-l border-gray-200 dark:border-gray-600 p-4'>
                    <div className='space-y-4'>
                        <Skeleton className='h-12 w-3/4' />
                        <Skeleton className='h-20 w-full' />
                        <Skeleton className='h-12 w-1/2' />
                        <Skeleton className='h-20 w-full' />
                    </div>
                </div>
            </div>
        )
    }

    if(isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-6 p-4">
                <div className="flex flex-col items-center space-y-2">
                    <svg 
                        className="h-12 w-12 text-destructive" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                        />
                    </svg>
                    <h1 className="text-2xl font-semibold text-foreground">Unable to load chat</h1>
                    <p className="text-muted-foreground">There was an error loading the chat. Please try again.</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        onClick={() => window.location.reload()}
                        className="min-w-[100px]"
                    >
                        Retry
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => window.location.href = '/dashboard'}
                        className="min-w-[100px]"
                    >
                        Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col md:flex-row '>
            {/* Left sidebar & main wrapper */}
            <div className='w-full md:w-1/3 lg:md:h-screen h-2/3'>
                <div className='px-0 pt-5 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                    {/* Main area */}
                    <PDFViewer url={data.fileUrl} />
                </div>
            </div>

            <div className='w-full md:w-2/3 border-l border-gray-200 dark:border-gray-600'>
                <ChatComponent chatId={Number(id)} />
            </div>
        </div>
    );
};

export default ChatPage;
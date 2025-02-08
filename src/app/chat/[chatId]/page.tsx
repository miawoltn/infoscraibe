
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
import { ArrowLeft, FileText } from 'lucide-react';
import { redirect } from 'next/navigation';
import React, { useState } from 'react'
import { cn } from '../../../lib/utils';
import Link from 'next/link';

type Props = {
    params: {
        chatId: string;
    }
}

const ChatPage =  ({ params: { chatId } }: Props) => {
    const [id, checksum] = decodeURIComponent(chatId).split(':')
    const [showPDF, setShowPDF] = useState(false);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['checksum', checksum],
        queryFn: async () => {
          const response = await axios.get(`/api/chat/${checksum}`);
          console.log(response.data)
          return response.data;
        },
        staleTime: Infinity
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
        <div className='flex flex-col h-[calc(100vh-3.5rem)]'>
        {/* Header with back button */}
        <div className="h-12 sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/75 dark:bg-gray-900/75 backdrop-blur-sm">
            <div className="flex items-center h-12 px-4">
                <Link 
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Documents</span>
                </Link>
            </div>
        </div>
        <div className='flex flex-col md:flex-row flex-1 h-[calc(100vh-3.5rem-3rem)]'>
        {/* PDF Toggle Button - Only visible on mobile */}
        <Button
            onClick={() => setShowPDF(!showPDF)}
            className="md:hidden fixed left-2 top-1/2 -translate-y-1/2 z-50 
                bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full 
                shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Toggle PDF Viewer"
        >
            <FileText className="h-6 w-6" />
        </Button>

        {/* PDF Viewer - Hidden by default on mobile */}
        <div className={cn(
            'w-full md:w-1/3 h-[calc(100vh-3.5rem-3rem)] absolute md:relative',
            'transition-transform duration-300 ease-in-out',
            'bg-white dark:bg-gray-900 z-40 md:z-0',
            showPDF ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}>
            <div className='h-[calc(100vh-3.5rem-3rem)] px-0 pt-5 sm:px-6 lg:pl-8 xl:pl-6'>
                <PDFViewer url={data.fileUrl} 
                showPDF={showPDF}
                onClose={() => setShowPDF(false)}/>
            </div>
        </div>

        {/* Overlay to close PDF viewer when clicking outside */}
        {showPDF && (
            <div 
                className="fixed inset-0 bg-black/40 z-30 md:hidden"
                onClick={() => setShowPDF(false)}
                aria-label="Close document overlay"
            />
        )}

        {/* Chat Component - Main view */}
        <div className='w-full md:w-2/3 h-[calc(100vh-3.5rem-3rem)] border-l border-gray-200 dark:border-gray-600 relative'>
            <ChatComponent chatId={Number(id)} />
        </div>
    </div>
    </div>
);
};

export default ChatPage;
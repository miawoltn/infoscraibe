
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
    const { isSignedIn, isLoaded } = useUser();
    if(!isLoaded) {
        return <Skeleton className='m-5 h-60 w-full' />
    }

    if(!isSignedIn) {
        return redirect('/sign-in'); 
    }

    const [id, checksum] = decodeURIComponent(chatId).split(':')
    const { data, isLoading, isError } = useQuery({
        queryKey: ['checksum', checksum],
        queryFn: async () => {
          const response = await axios.get(`/api/chat/${checksum}`);
          console.log(response.data)
          return response.data;
        },
        staleTime: Infinity
    })

    if(isLoading) {
        return <Skeleton className='m-5 h-60 w-full'/>
    }

    if(isError) {
        return redirect('/dashboard')
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


import ChatComponent from '@/components/ChatComponent';
import ChatSideBar from '@/components/ChatSideBar';
import PDFViewer from '@/components/PDFViewer';
import { Button } from '@/components/ui/button';
import { db, getChatByUserIdAndChatId, getChatByUserIdAndChecksum } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { checkSubscription } from '@/lib/subscription';
import { auth } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = {
    params: {
        chatId: string;
    }
}

const ChatPage = async ({ params: { chatId } }: Props) => {
    const { userId } = auth();
    if (!userId) return redirect('/sign-in');

    const [id, checksum] = decodeURIComponent(chatId).split(':')
    const currentChat = await getChatByUserIdAndChecksum(userId, checksum);
    if (!currentChat) {
        return redirect('/dashboard');
    }

    const isPro = await checkSubscription();

    return (
        <div className='flex flex-col md:flex-row '>
            {/* Left sidebar & main wrapper */}
            <div className='w-full md:w-1/3 lg:md:h-screen h-2/3'>
                <div className='px-0 pt-5 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                    {/* Main area */}
                    <PDFViewer url={currentChat.fileUrl} />
                </div>
            </div>

            <div className='w-full md:w-2/3 border-l border-gray-200 dark:border-gray-600'>
                <ChatComponent chatId={Number(id)} />
            </div>
        </div>
    );
};

export default ChatPage;
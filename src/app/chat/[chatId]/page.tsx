

import ChatComponent from '@/components/ChatComponent';
import ChatSideBar from '@/components/ChatSideBar';
import PdfViewer from '@/components/PdfViewer';
import { db, getChatByUserIdAndChatId } from '@/lib/db';
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

    const currentChat = await getChatByUserIdAndChatId(userId, Number(chatId));
    if (!currentChat) {
        return redirect('/');
    }

    const isPro = await checkSubscription();

    return (
        <div className='flex-1 justify-between flex flex-col overscroll-none overflow-hidden'>
            <div className='border-b mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
                {/* Left sidebar & main wrapper */}
                <div className='flex-1 xl:flex'>
                    <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                        {/* Main area */}
                        <PdfViewer url={currentChat.pdfUrl} />
                    </div>
                </div>

                <div className='shrink-0 flex-[0.65] border-t border-b border-gray-200 lg:flex lg:w-96 lg:border-l lg:border-t-0 mb-1'>
                {/* <div className='flex-1 xl:flex'> */}
                    <ChatComponent chatId={Number(chatId)} />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
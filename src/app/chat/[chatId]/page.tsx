

import ChatComponent from '@/components/ChatComponent';
import ChatSideBar from '@/components/ChatSideBar';
import PDFViewer from '@/components/PDFViewer';
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
        <div className='flex flex-col md:flex-row '>
                {/* Left sidebar & main wrapper */}
                <div className='w-full md:w-1/2 lg:md:h-screen h-1/3'>
                    <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                        {/* Main area */}
                        <PDFViewer url={currentChat.pdfUrl} />
                    </div>
                </div>

                <div className='w-full md:w-1/2 border-t border-b border-gray-200'>
                    <ChatComponent chatId={Number(chatId)} />
                </div>
        </div>
    );
};

export default ChatPage;
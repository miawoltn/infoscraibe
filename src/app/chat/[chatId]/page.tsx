

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
        // <div className='flex max-h-screen overflow-scroll'>
        //     <div className='flex w-full max-h-screen overflow-scroll'>
        //         {/* chat sidebar */}
        //         {/* <div className='flex-[1] max-w-xs'>
        //             <ChatSideBar chats={_chats} chatId={+userId} isPro={isPro} />
        //         </div> */}

        //         {/* pdf viewer */}
        //         <div className='p-4 overflow-scroll flex-[5]'>
        //             <PdfViewer url={currentChat.pdfUrl} />
        //         </div>

        //         {/* chat component */}
        //         <div className='flex-[3] border-1-4 border-1-slate-200'>
        //             <ChatComponent chatId={Number(chatId)} />
        //         </div>
        //     </div>
        // </div>
        <div className='flex-1 justify-between flex flex-col h-screen overscroll-none overflow-hidden'>
            <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
                {/* Left sidebar & main wrapper */}
                <div className='flex-1 xl:flex'>
                    <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                        {/* Main area */}
                        <PdfViewer url={currentChat.pdfUrl} />
                    </div>
                </div>

                <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
                    <ChatComponent chatId={Number(chatId)} />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
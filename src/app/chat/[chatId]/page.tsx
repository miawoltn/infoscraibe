

import ChatComponent from '@/components/ChatComponent';
import ChatSideBar from '@/components/ChatSideBar';
import PDFViewer from '@/components/PDFViewer';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
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

    const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
    if(!_chats) {
        return redirect('/');
    }
    
    const currentChat = _chats.find(chat => chat.id === Number(chatId));
    if(!currentChat) {
        return redirect('/');
    }


    return (
        <div className='flex max-h-screen overflow-scroll'>
            <div className='flex w-full max-h-screen overflow-scroll'>
                {/* chat sidebar */}
                <div className='flex-[1] max-w-xs'>
                    <ChatSideBar chats={_chats} chatId={+userId} />
                </div>

                {/* pdf viewer */}
                <div className='max-h-screen p-4 overflow-scroll flex-[5]'>
                    <PDFViewer pdfUrl={currentChat.pdfUrl} />
                </div>

                {/* chat component */}
                <div className='flex-[3] border-1-4 border-1-slate-200'>
                    <ChatComponent chatId={Number(chatId)} />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
import { cn } from '@/lib/utils'
import { Message } from 'ai/react'
import { Loader2, MessageCircleWarningIcon, Target } from 'lucide-react'
import React from 'react'
import { Icons } from './Icons'
import { format, formatRelative, subDays } from 'date-fns'
import Markdown from 'markdown-to-jsx'
// import Markdown from 'react-markdown'



type Props = {
    messages: Message[],
    isLoading: boolean
}

const MessageList = ({ messages, isLoading }: Props) => {
    if (isLoading) {
        return (
            <div className="grid h-screen place-items-center">
                <Loader2 className='w-6 h-6 animate-spin items-center' />
            </div>
        )
    }
    if (!messages.length) {
        return (
            <div className='mt-16 flex flex-col text-center items-center gap-2'>
                <MessageCircleWarningIcon className='h-8 w-8 text-zinc-800 dark:text-zinc-200' />
                <h3 className='font-semibold text-xl'>
                    Pretty empty around here
                </h3>
                <p>Start chatting with your document.</p>
            </div>
        )
    }
    return (
        <div className='flex flex-col gap-3 px-4'>
            {messages.sort((a, b) => +a.id - +b.id).map((message) => (

                <div
                    key={message.id}
                    className={cn('flex flex-row margin-auto', {
                        'justify-end pl-10': message.role === 'user',
                        'justify-start pr-10': message.role === 'system',
                    })}
                >
                    <div
                        className={cn(
                            'relative flex flex-shrink-0 h-6 w-6 aspect-square',
                            {
                                'order-2 bg-black-600 rounded-sm':
                                    message.role === 'user',
                                // 'order-1 bg-black-600 rounded-sm':
                                //     message.role === 'system',
                                // invisible: message.role === messages[index - 1]?.role,
                            }
                        )}>
                        {message.role === 'user' ? (
                            <Icons.user className='fill-black-200 text-black-200' />
                        ) : (
                            <Icons.logo className='fill-black-300 dark:fill-white' />
                        )}
                    </div>
                    <div className={cn('rounded-lg px-3 text-sm py-1 mb-2 shadow-md ring-1 ring-gray-900/10 inline-block', {
                        'bg-gray-800 border border-gray-800 text-white max-w-1/2': message.role === 'user',
                        'max-w-2/3 items-baseline text-balance': message.role === 'system'
                    })}>

                        <Markdown
                            className={cn('prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 font-medium', {
                                'text-zinc-50': message.role === 'user',
                            })}>
                            {message.content}
                        </Markdown>
                        {/* <p className='text-sm'> <i> {formatRelative((message.createdAt!), new Date())}</i></p> */}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MessageList
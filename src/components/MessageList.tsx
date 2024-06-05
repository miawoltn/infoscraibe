import { cn } from '@/lib/utils'
import { Message } from 'ai/react'
import { Loader2, Target } from 'lucide-react'
import React from 'react'
import { Icons } from './Icons'
import { format } from 'date-fns'
import Markdown from 'react-markdown'

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
    if (!messages) {
        return (<></>)
    }
    return (
        <div className='flex flex-col gap-3 px-4'>
            {messages.sort((a, b) => +a.id - +b.id).map((message) => (

                <div
                    key={message.id}
                    className={cn('flex', {
                        'justify-end pl-10': message.role === 'user',
                        'justify-start pr-10': message.role === 'assistant',
                    })}
                >
                    <div
                        className={cn(
                            'relative flex h-6 w-6 aspect-square items-center justify-center',
                            {
                                'order-2 bg-black-600 rounded-sm':
                                    message.role === 'user',
                                'order-1 bg-black-600 rounded-sm':
                                    message.role === 'assistant',
                                // invisible: message.role === messages[index - 1]?.role,
                            }
                        )}>
                        {message.role === 'user' ? (
                            <Icons.user className='fill-black-200 text-black-200 h-3/4 w-3/4' />
                        ) : (
                            <Icons.logo className='fill-black-300 h-3/4 w-3/4' />
                        )}
                    </div>
                    <div className={cn('rounded-lg px-3 text-sm py-1 mb-2 shadow-md ring-1 ring-gray-900/10 inline-block', {
                        'bg-blue-600 text-white': message.role === 'user'
                    })}>

                        {typeof message.content === 'string' ? (
                            <Markdown
                                className={cn('prose', {
                                    'text-zinc-50': message.role === 'user',
                                })}>
                                {message.content}
                            </Markdown>
                        ) : (
                            <p> {message.content}</p>
                        )}

                        <i> {format(
                            message.createdAt!,
                            'HH:mm'
                        )}</i>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MessageList
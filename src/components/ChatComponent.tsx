'use client'
import { DrizzleChat } from '@/lib/db/schema'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { PlusCircle, Send, Loader2, ArrowUp } from 'lucide-react'
import { Input } from './ui/input'
import { useChat } from 'ai/react'
import MessageList from './MessageList'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Message } from 'ai'
import ChatInput from './ChatInput'
import { Textarea } from './ui/textarea'

type Props = {
  chatId: number
};

const ChatComponent = ({ chatId }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [previousMessage, setPreviousMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>('/api/get-messages', { chatId });
      return response.data;
    }
  })
  const { input, handleInputChange, handleSubmit, messages, isLoading: isAithinking } = useChat({
    api: '/api/chat',
    body: { chatId },
    initialMessages: data || [],
    onError: (error) => {
      console.error(error)
    },
    onResponse: (response) => {
        console.log(response);
    },
    onFinish: (message) => {
      console.log(message);
    },
  });

  useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      });
    }

  }, [messages])

  const isButtonDisabled = isLoading || isAithinking || !!!input

  return (
    <div className='flex flex-col h-dvh' id='message-container'>

      <div className='overflow-auto p-4 pb-28'>
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <form onSubmit={handleSubmit} className='fixed bottom-0 right-0 w-1/2  p-1 grainy'>
        <div className="flex flex-row items-center">
          <Textarea
            ref={textareaRef}
            disabled={isLoading}
            rows={1}
            value={input}
            autoFocus={false}
            onChange={handleInputChange}
            placeholder='Ask any question...'
            className='min-h-[0] resize-none pr-12 text-base py-2 focus:ring-1 focus-visible:ring-1'
          />
          <Button disabled={isButtonDisabled} className='bg-blue-800 ml-2 rounded' variant='default'>
            <ArrowUp className='h-4 w-4' />
          </Button>
        </div>
      </form>
    </div>
  )
};

export default ChatComponent;
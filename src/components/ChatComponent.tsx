'use client'
import { DrizzleChat } from '@/lib/db/schema'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { PlusCircle, Send, Loader2 } from 'lucide-react'
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

  const [responding, setResponding] = useState(false);
  const [previousMessage, setPreviousMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>('/api/get-messages', { chatId });
      return response.data;
    }
  })
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: '/api/chat',
    body: { chatId },
    initialMessages: data || [],
    onError: (error) => {
      console.error(error)
    },
    onResponse: (response) => {
        console.log(response);
        setResponding(true)
    },
    onFinish: (message) => {
      console.log(message);
      setResponding(false)
    }
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

  return (
    <div className='bg-zinc-50 flex flex-col divide-y divide-zinc-20 lg:md:absolute lg:md:inset-y-0 lg:md:px-0 lg:py-1' id='message-container'>
      {/* <div className=' flex-[0.1] items-center'>
        <h3 className='text-xl font-bold'>Chat</h3>
      </div> */}

      <div className='justify-between lg:md:pt-10 mt-10 lg:md:sm:overflow-auto'>
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* <form onSubmit={handleSubmit} className='absolute bottom-0 inset-x-0 px-2 py-4 bg-white'></form> */}
      <form onSubmit={handleSubmit} className='bg-white shadow shadow-black-400'>
        <div className="flex flex-row items-center">
          <Textarea
            ref={textareaRef}
            disabled={isLoading}
            rows={1}
            autoFocus
            value={input}
            onChange={handleInputChange}
            placeholder='Ask any question...'
            className='min-h-[0] resize-none pr-12 text-base py-2 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-0 scrolling-touch'
          />
          <Button disabled={isLoading || responding} className='bg-blue-800 ml-2' variant='secondary'>
            <Send className='h-5 w-5' />
          </Button>
        </div>
      </form>
    </div>
  )
};

export default ChatComponent;
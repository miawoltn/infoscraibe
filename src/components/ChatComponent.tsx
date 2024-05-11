'use client'
import { DrizzleChat } from '@/lib/db/schema'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { Button } from './ui/button'
import { PlusCircle, Send } from 'lucide-react'
import { Input } from './ui/input'
import { useChat } from 'ai/react'
import MessageList from './MessageList'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Message } from 'ai'

type Props = {
  chatId: number
};

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>('/api/get-messages', {chatId});
      return response.data;
    }
  })
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: '/api/chat',
    body: { chatId },
    initialMessages: data || []
  });

  useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if(messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  
  }, [messages])
  
  return (
    <div className='relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2' id='message-container'>
      {/* <div className='flex flex-col items-center'>
        <h3 className='text-xl font-bold'>Chat</h3>
      </div>   */}

      <div className='flex-1 justify-between flex flex-col mb-28'>
      <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* <form onSubmit={handleSubmit} className='absolute bottom-0 inset-x-0 px-2 py-4 bg-white'>
        <div className="flex">
          <Input value={input} onChange={handleInputChange} placeholder='Ask any question...' className='w-full' />
          <Button className='bg-blue-800 ml-2'>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </form> */}
    </div>
  )
};

export default ChatComponent;
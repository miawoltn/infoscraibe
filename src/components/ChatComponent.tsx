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
    <div className='flex flex-col h-dvh' id='message-container'>

      <div className='overflow-auto p-4 pb-28'>
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <form onSubmit={handleSubmit} className='fixed bottom-0 right-0 w-1/2 bg-white shadow shadow-black-400 p-1 border-t'>
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
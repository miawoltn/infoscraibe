'use client'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { PlusCircle, Send, Loader2, ArrowUp, Dot } from 'lucide-react'
import { Input } from './ui/input'
import { useChat } from 'ai/react'
import MessageList from './MessageList'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Message } from 'ai'
import ChatInput from './ChatInput'
import { Textarea } from './ui/textarea'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Props = {
  chatId: number
};

const ChatComponent = ({ chatId }: Props) => {

  const { data, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>('/api/get-messages', { chatId });
      return response.data;
    }
  })
  const { input, handleInputChange, handleSubmit, messages, isLoading: isAithinking, setInput } = useChat({
    api: '/api/chat',
    body: { chatId },
    initialMessages: data || [],
    onError: (error) => {
      toast.error('Unable to process chat.')
      setInput(input)
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

  const isButtonDisabled = isLoading || isAithinking || !!!input

  return (
    <div className='flex flex-col h-dvh bg-white shadow shadow-black-400'>

      <div className='overflow-auto p-4 pb-28' id='message-container'>
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <form onSubmit={handleSubmit} className='fixed bottom-0 right-0 md:w-1/2 w-full p-1 bg-white shadow-black-400'>
        <p className={cn('animate-bounce items-center ml-7', {
          "hidden": isAithinking === false,
        })}> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></p>
        <div className="flex flex-row items-center">
          <Textarea
            // ref={textareaRef}
            disabled={isLoading}
            rows={1}
            value={input}
            autoFocus={false}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && "form" in e.target) {
                e.preventDefault();
                (e.target.form as HTMLFormElement).requestSubmit();
              }
            }}
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
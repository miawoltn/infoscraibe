'use client'
import { DrizzleChat } from '@/lib/db/schema'
import Link from 'next/link'
import React from 'react'
import { Button } from './button'
import { PlusCircle, Send } from 'lucide-react'
import { Input } from './ui/input'
import { useChat } from 'ai/react'
import MessageList from './MessageList'

type Props = {};

const ChatComponent = ({ }: Props) => {
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: '/api/chat'
  });
  return (
    <div className='relative max-h-screen overflow-scroll'>
      <div className='sticky top-0 inset-x-0 p-2 bg-white h-fit'>
        <h3 className='text-xl font-bold'>Chat</h3>
      </div>

      <MessageList messages={messages} />

      <form onSubmit={handleSubmit} className='sticky bottom-0 inset-x-0 px-2 py-4 bg-white'>
        <div className="flex">
        <Input value={input} onChange={handleInputChange} placeholder='Ask any question...' className='w-full' />
        <Button className='bg-blue-800 ml-2'>
          <Send className='h-4 w-4' />
        </Button>
        </div>
      </form>
    </div>
  )
};

export default ChatComponent;
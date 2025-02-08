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
import MessageInput from './MessageInput'
import { Textarea } from './ui/textarea'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Props = {
  chatId: number
};

const ChatComponent = ({ chatId }: Props) => {
  const [mode, setMode] = useState<'multi' | 'single'>('single');
  const [textareaRows, setTextareaRows] = useState(1);


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

  const sendMessage = (message: string) => {
  }

  useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      });
    }

  }, [messages])

  useEffect(() => {
    if (textareaRows >= 2 && input && mode === 'single') {
      setMode('multi');
    } else if (!input && mode === 'multi') {
      setMode('single');
    }
  }, [textareaRows, mode, input]);

  const isButtonDisabled = (isLoading && !data) || isAithinking || !input.trim();

//   return (
//     <div className='flex flex-col h-dvh bg-white dark:bg-background shadow shadow-black-400'>

//       <div className='overflow-auto p-4 mb-10 pb-10' id='message-container'>
//         <MessageList messages={messages} isLoading={isLoading} />
//       </div>

//       {/* <div className='fixed bottom-0 overflow-auto bg-background pb-10 w-full'> */}
//       <MessageInput isAiThinking={isAithinking} loading={isAithinking} message={input} handleSubmit={handleSubmit} handleInputChange={handleInputChange} />
//       {/* </div> */}
//     </div>
//   )

return (
  <div className='flex flex-col h-full bg-white dark:bg-background relative'>
    {/* Message container with proper padding and scroll containment */}
    <div 
      id='message-container'
      className='flex-1 overflow-y-auto pb-32 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700'
      >
      <MessageList messages={messages} isLoading={isLoading} />
    </div>

    {/* Gradient overlay to fade content under input */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-background to-transparent pointer-events-none" />

    {/* Input container with fixed positioning */}
    <div className="absolute bottom-0 left-0 right-0 mb-1">
      <MessageInput 
        isAiThinking={isAithinking} 
        loading={isAithinking} 
        message={input} 
        handleSubmit={handleSubmit} 
        handleInputChange={handleInputChange} 
        />
    </div>
  </div>
)
};

export default ChatComponent;
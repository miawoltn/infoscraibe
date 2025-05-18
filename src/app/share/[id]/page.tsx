'use client'

import MessageList from "@/components/MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "../../../components/ui/scroll-area";

export default function SharedChat({
  params: { id },
}: {
  params: { id: string };
}) {

  console.log({ id })
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shared-chat', id],
    queryFn: async () => {
      const response = await axios.get(`/api/chat/share/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-zinc-500">Loading shared chat...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-4 rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Unable to load chat</h3>
          <p className="text-sm text-gray-500">This chat may have expired or been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Shared Chat
        </h1>
        <p className="text-sm text-gray-500">
          Shared on {new Date(data.createdAt).toLocaleDateString()}
        </p>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)] scroll-m-0">
        <MessageList messages={data.messages} isLoading={false} isShared={false} />
      </ScrollArea>
    </div>
  );
}
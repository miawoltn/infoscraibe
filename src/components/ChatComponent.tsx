"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { PlusCircle, Send, Loader2, ArrowUp, Dot } from "lucide-react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message as BaseMessage } from "ai";
import MessageInput from "./MessageInput";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Props = {
  chatId: number;
};

interface Message extends BaseMessage {
  previousVersions?: string[];
  regenerationCount?: number;
  id: string;
  content: string;
}

const ChatComponent = ({ chatId }: Props) => {
  const [mode, setMode] = useState<"multi" | "single">("single");
  const [textareaRows, setTextareaRows] = useState(1);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    isLoading: isAithinking,
    setInput,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: { chatId },
    initialMessages: (data || []) as Message[],
    onError: (error) => {
      toast.error("Unable to process chat.");
      setInput(input);
    },
  }) as {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    messages: Message[];
    isLoading: boolean;
    setInput: (input: string) => void;
    setMessages: (messages: Message[]) => void;
  };

  const handleRegenerate = async (messageId: string) => {
    try {
      setRegeneratingId(messageId);
      const messageToRegenerate = messages.find((m) => m.id === messageId);
      if (!messageToRegenerate) return;

      // Find the last user message before this AI response
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      const previousUserMessage = messages
        .slice(0, messageIndex)
        .reverse()
        .find((m) => m.role === "user");

      if (!previousUserMessage) {
        toast.error("Could not find corresponding user message");
        return;
      }

      setShouldScrollToBottom(false); // Prevent auto-scroll

      // Scroll to the message being regenerated
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Store the current content before regeneration
      const currentContent = messageToRegenerate.content;

      const response = await fetch("/api/chat/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.slice(0, messageIndex + 1),
          chatId,
          messageId,
          previousUserMessageId: previousUserMessage.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.regenerationCount >= 3) {
          toast.error("Please delete a previous version to continue");
          return;
        }
        throw new Error("Failed to regenerate response");
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = "";

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        content += decoder.decode(value);

        // Update message in real-time
        setMessages(
          messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  content,
                  previousVersions: [
                    ...(m.previousVersions || []),
                    currentContent,
                  ],
                }
              : m
          )
        );
      }
    } catch (error) {
      toast.error("Failed to regenerate response");
      console.error("Regeneration failed:", error);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDeleteVersion = async (
    messageId: string,
    versionIndex: number
  ) => {
    try {
      await axios.post("/api/chat/delete-version", {
        messageId,
        versionIndex,
      });

      // Refresh messages after deletion
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      setMessages(response.data);
    } catch (error) {
      toast.error("Failed to delete version");
    }
  };

  useEffect(() => {
    if (shouldScrollToBottom && !regeneratingId) {
      const messageContainer = document.getElementById("message-container");
      if (messageContainer) {
        messageContainer.scrollTo({
          top: messageContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, shouldScrollToBottom, regeneratingId]);

  useEffect(() => {
    if (textareaRows >= 2 && input && mode === "single") {
      setMode("multi");
    } else if (!input && mode === "multi") {
      setMode("single");
    }
  }, [textareaRows, mode, input]);

  const isButtonDisabled =
    (isLoading && !data) || isAithinking || !input.trim();

  // Reset scroll behavior when sending new messages
  const handleMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setShouldScrollToBottom(true);
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-background relative">
      {/* Message container with proper padding and scroll containment */}
      <div
        id="message-container"
        className="flex-1 overflow-y-auto pb-32 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700"
      >
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onRegenerate={handleRegenerate}
          regeneratingId={regeneratingId}
          onDeleteVersion={handleDeleteVersion}
        />
      </div>

      {/* Gradient overlay to fade content under input */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-background to-transparent pointer-events-none" />

      {/* Input container with fixed positioning */}
      <div className="absolute bottom-0 left-0 right-0">
        <MessageInput
          isAiThinking={isAithinking}
          loading={isAithinking}
          message={input}
          handleSubmit={handleMessageSubmit}
          handleInputChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default ChatComponent;

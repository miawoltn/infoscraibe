"use client";
import React, { useEffect, useState } from "react";
import { useChat } from "ai/react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import MessageInput from "./MessageInput";
import { Message } from "@/lib/utils";
import toast from "react-hot-toast";

type Props = {
  chatId: number;
};

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
    staleTime: Infinity,
  });

  const {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    isLoading: isAithinking,
    setInput,
    setMessages,
    reload,
    error
  } = useChat({
    api: "/api/chat",
    body: { chatId },
    initialMessages: (data || []) as Message[],
    // onResponse: (response) => {
    // Ensure streaming messages get the isShared property
    //  setMessages(
    //   rawMessages.map((m) => ({
    //      ...m,
    //     isShared: true // Add isShared property to all messages
    //   })
    //   )
    // );
    // },
    onFinish(message) {
      console.log({ message })
      updateLastMessage();
    },
    onError: (error) => {
      toast.error(error?.message || "Unable to process chat.");
      setInput(input);
    },
  }) as {
    input: string;
    handleInputChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    messages: Message[];
    isLoading: boolean;
    setInput: (input: string) => void;
    setMessages: (messages: Message[]) => void;
    reload: () => void;
    error: undefined | Error;
  };

  // Transform messages to ensure isShared is always present
  // const messages = React.useMemo(() => {
  //   return rawMessages.map(msg => ({
  //     ...msg,
  //   }));
  // }, [rawMessages]);

  // TODO: work on updating the last message within the messages array 
  // role returned as 'assisted'
  const updateLastMessage = async () => {
    try {
      6
      const messageResponse = await fetch(
        `/api/chat/${chatId}/last-message`
      );
      console.log({ messageResponse })
      if (messageResponse.ok) {
        const { user, system } = await messageResponse.json();
        console.log({ user, system })
        console.log({ messages })
        // update messages with setMessges with the last message from the api
        user && messages.push(user)
        system && messages.push(system)
        setMessages(messages)
      }
    } catch (error) {
      console.error("Error updating last message:", error);
    }
  }

  const handleRegenerate = async (messageId: string) => {
    try {
      setRegeneratingId(messageId);
      const messageToRegenerate = messages.find((m) => m.id === messageId);
      if (!messageToRegenerate) return;

      // Store the current content before any changes
      const currentContent = messageToRegenerate.content;
      const currentVersions = messageToRegenerate.previousVersions || [];

      // Clear the content immediately when regeneration starts
      setMessages(
        messages.map((m) =>
          m.id === messageId
            ? {
              ...m,
              content: "", // Clear content to show loader
              previousVersions: [...(m.previousVersions || []), m.content],
            }
            : m
        )
      );

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
        } else {
          toast.error("Failed to regenerate response");
        }
        // Restore the original content and versions
        setMessages(
          messages.map((m) =>
            m.id === messageId
              ? {
                ...m,
                content: currentContent,
                previousVersions: currentVersions,
              }
              : m
          )
        );
        return;
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = "";
      let hasReceivedContent = false;

      while (reader) {
        try {
          const { value, done } = await reader.read();
          if (done) {
            const messageResponse = await fetch(
              `/api/get-messages/${messageId}`
            );
            if (messageResponse.ok) {
              const { message } = await messageResponse.json();
              setMessages(
                messages.map((m) =>
                  m.id === messageId
                    ? {
                      ...message,
                    }
                    : m
                )
              );
            }
            break;
          }

          content += decoder.decode(value);
          hasReceivedContent = true;
          console.log({ content });

          // Update message in real-time
          if (content.trim()) {
            setMessages(
              messages.map((m) =>
                m.id === messageId
                  ? {
                    ...m,
                    content,
                    previousVersions: [...currentVersions, currentContent],
                  }
                  : m
              )
            );
          }
        } catch (streamError) {
          console.error("Stream error:", streamError);
          // Restore original state on stream error
          setMessages(
            messages.map((m) =>
              m.id === messageId
                ? {
                  ...m,
                  content: currentContent,
                  previousVersions: currentVersions,
                }
                : m
            )
          );
          throw streamError;
        }
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

  const handleFeedback = async (
    messageId: string,
    feedback: "like" | "dislike" | null,
    reason?: string
  ) => {
    try {
      const response = await axios.post("/api/chat/feedback", {
        messageId,
        feedback,
        reason,
      });

      // Update message in state
      setMessages(
        messages.map((m) =>
          m.id === messageId ? { ...m, feedback, feedbackReason: reason } : m
        )
      );

      if (feedback === "like" || feedback === "dislike") {
        toast.success(
          feedback === "like"
            ? "Thanks for the feedback!"
            : "Thank you for helping us improve"
        );
      }
    } catch (error) {
      toast.error("Failed to save feedback");
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
          onFeedback={handleFeedback}
          isShared={true} // Set default to true since all messages should have actions
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

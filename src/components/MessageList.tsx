import { cn } from "@/lib/utils";
import { Message as BaseMessage } from "ai/react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircleWarningIcon,
  Target,
  Trash,
} from "lucide-react";
import React from "react";
import { Icons } from "./Icons";
import { format, formatRelative, subDays } from "date-fns";
import Markdown from "markdown-to-jsx";
import {
  Copy,
  CheckCheck,
  CornerUpRight,
  ThumbsUp,
  ThumbsDown,
  Share2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialog,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";

interface Message extends BaseMessage {
  previousVersions?: string[];
  regenerationCount?: number;
  regenerationLabels?: string[];
  id: string;
  content: string;
}

type Props = {
  messages: Message[];
  isLoading: boolean;
  isShared?: boolean;
  onRegenerate?: (messageId: string) => void;
  regeneratingId?: string | null;
  onDeleteVersion?: (messageId: string, versionIndex: number) => void;
};

const MessageList = ({
  messages,
  isLoading,
  isShared = true,
  onRegenerate,
  regeneratingId,
  onDeleteVersion,
}: Props) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showVersions, setShowVersions] = useState<string | null>(null);
  const [versionIndices, setVersionIndices] = useState<Record<string, number>>(
    {}
  );

  const getCurrentContent = (message: Message) => {
    if (!message.previousVersions?.length) return message.content;
    const versions = [...message.previousVersions, message.content];
    const currentIndex = versionIndices[message.id] ?? versions.length - 1;
    return versions[currentIndex];
  };

  const handleVersionNavigation = (
    messageId: string,
    direction: "prev" | "next"
  ) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message?.previousVersions) return;

    const versions = [...message.previousVersions, message.content];
    const currentIndex = versionIndices[message.id] ?? versions.length - 1;

    setVersionIndices((prev) => ({
      ...prev,
      [messageId]:
        direction === "prev"
          ? Math.max(0, currentIndex - 1)
          : Math.min(versions.length - 1, currentIndex + 1),
    }));
  };

  const handleCopy = async (message: Message) => {
    try {
      const contentToCopy = getCurrentContent(message);
      await navigator.clipboard.writeText(contentToCopy);
      setCopiedMessageId(message.id);
      toast.success("Copied!");

      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const response = await axios.post("/api/chat/share", {
        messages,
        chatId: window.location.pathname.split("/").pop(),
      });

      if (navigator.share) {
        await navigator.share({
          title: "Shared Chat",
          text: "Check out this chat!",
          url: response.data.shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(response.data.shareUrl);
        toast.success(
          "Share link copied to clipboard! Link expires in 7 days."
        );
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share chat");
    } finally {
      setIsSharing(false);
    }
  };

  // ...existing code...

  const handleDeleteVersion = (messageId: string, versionIndex: number) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message?.previousVersions) return {};

    const totalVersions = message.previousVersions.length + 1;
    const isCurrentVersion = versionIndex === totalVersions - 1;
    const versionNumber = versionIndex + 1;

    return {
      title: `Delete ${
        isCurrentVersion ? "Current" : `Version ${versionNumber}`
      }`,
      description: `Are you sure you want to delete ${
        isCurrentVersion ? "the current version" : `version ${versionNumber}`
      }? ${
        totalVersions <= 2
          ? "This will revert to the original response."
          : `You will still have ${totalVersions - 1} version${
              totalVersions - 1 > 1 ? "s" : ""
            }.`
      }`,
      version: versionIndex,
      totalVersions,
    };
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Processing your request...
          </p>
        </div>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="mt-16 flex flex-col text-center items-center gap-3">
        <div className="p-4 rounded-full bg-blue-500/10">
          <MessageCircleWarningIcon className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="font-semibold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Start Your Conversation
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
          Ask questions about your document and get instant answers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-3 max-w-3xl mx-auto">
      {messages.length > 0 && isShared && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2 px-3 py-2 text-sm 
              bg-blue-500 text-white rounded-md hover:bg-blue-600 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Share Chat
          </button>
        </div>
      )}
      {messages
        .sort((a, b) => +a.id - +b.id)
        .map((message, index) => (
          <div
            key={message.id}
            id={`message-${message.id}`}
            className={cn("group flex items-start gap-4 relative", {
              "animate-fadeIn": index === messages.length - 1,
            })}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md shadow-sm",
                {
                  "bg-blue-500 text-white": message.role === "user",
                  "bg-slate-100 dark:bg-slate-800": message.role === "system",
                }
              )}
            >
              {message.role === "user" ? (
                <Icons.user className="h-5 w-5" />
              ) : (
                <Icons.logo className="h-5 w-5" />
              )}
            </div>

            <div className={cn("flex-1 space-y-2 overflow-hidden px-1")}>
              <div
                className={cn("prose dark:prose-invert max-w-none", {
                  "text-gray-900 dark:text-gray-100": message.role === "system",
                  "text-blue-600 dark:text-blue-400": message.role === "user",
                })}
              >
                <Markdown
                  options={{
                    overrides: {
                      pre: {
                        props: {
                          className:
                            "bg-slate-100 dark:bg-slate-800 rounded-lg p-4 my-2 overflow-x-auto",
                        },
                      },
                      code: {
                        props: {
                          className:
                            "bg-slate-100 dark:bg-slate-800 rounded px-1 py-0.5",
                        },
                      },
                    },
                  }}
                >
                  {getCurrentContent(message)}
                </Markdown>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {format(new Date(message.createdAt || new Date()), "h:mm a")}
                </span>
                {isShared && (
                  <div
                    className={cn(
                      "flex items-center gap-2 transition-opacity",
                      index === messages.length - 1
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {" "}
                    <button
                      onClick={() => handleCopy(message)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                      title={
                        copiedMessageId === message.id
                          ? "Copied!"
                          : "Copy message"
                      }
                    >
                      {copiedMessageId === message.id ? (
                        <CheckCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    {message.role === "system" && (
                      <>
                        <button
                          onClick={() => onRegenerate?.(message.id)}
                          disabled={regeneratingId === message.id}
                          className={cn(
                            "p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors",
                            regeneratingId === message.id && "animate-pulse"
                          )}
                          title="Regenerate response"
                        >
                          {regeneratingId === message.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CornerUpRight className="h-4 w-4" />
                          )}
                        </button>
                        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                        <div className="flex gap-1">
                          <button
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            title="Good response"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            title="Bad response"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                    {message.role === "system" &&
                      (message.previousVersions?.length || 0) > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleVersionNavigation(message.id, "prev")
                            }
                            disabled={versionIndices[message.id] === 0}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md 
                    transition-colors disabled:opacity-50"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          <span className="text-sm font-medium">
                            {(versionIndices[message.id] ??
                              message.previousVersions!.length) + 1}{" "}
                            of {message.previousVersions!.length + 1}
                          </span>

                          <button
                            onClick={() =>
                              handleVersionNavigation(message.id, "next")
                            }
                            disabled={
                              versionIndices[message.id] ===
                              message.previousVersions!.length
                            }
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md 
                    transition-colors disabled:opacity-50"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md 
            transition-colors text-red-500 hover:text-red-600"
                                title="Delete this version"
                                disabled={
                                  !message.previousVersions ||
                                  message.previousVersions.length === 0
                                }
                              >
                                <Trash
                                  className={cn(
                                    "h-4 w-4",
                                    (!message.previousVersions ||
                                      message.previousVersions.length === 0) &&
                                      "opacity-50 cursor-not-allowed"
                                  )}
                                />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {
                                    handleDeleteVersion(
                                      message.id,
                                      versionIndices[message.id] ||
                                        message.previousVersions!.length
                                    ).title
                                  }
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {
                                    handleDeleteVersion(
                                      message.id,
                                      versionIndices[message.id] ||
                                        message.previousVersions!.length
                                    ).description
                                  }
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                  onClick={async () => {
                                    const info =
                                      handleDeleteVersion(
                                        message.id,
                                        versionIndices[message.id] ||
                                          message.previousVersions!.length
                                      ) || {};

                                    try {
                                      toast.promise(
                                        onDeleteVersion?.(
                                          message.id,
                                          info.version!
                                        )!,
                                        {
                                          loading: "Deleting version...",
                                          success:
                                            info.totalVersions! <= 2
                                              ? "Reverted to original response"
                                              : `Version ${
                                                  info.version! + 1
                                                } deleted successfully`,
                                          error: "Failed to delete version",
                                        }
                                      );

                                      // Reset version index if needed
                                      if (
                                        info.version ===
                                        info.totalVersions! - 1
                                      ) {
                                        setVersionIndices((prev) => ({
                                          ...prev,
                                          [message.id]: Math.max(
                                            0,
                                            (prev[message.id] || 0) - 1
                                          ),
                                        }));
                                      }
                                    } catch (error) {
                                      console.error("Delete failed:", error);
                                    }
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default MessageList;

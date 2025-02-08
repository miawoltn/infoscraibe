"use client";

import {
  FileText,
  Ghost,
  Loader2,
  MessageSquare,
  Plus,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import FileUpload from "./FileUpload";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import toast from "react-hot-toast";
import { Skeleton } from "./ui/skeleton";

interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const Dashboard = ({ subscriptionPlan }: PageProps) => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<
    string | null
  >(null);
  const [showAlert, setShowAlert] = useState(false);

  const queryClient = useQueryClient();
  const {
    data: files,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [""],
    queryFn: async () => (await axios.get<any[]>("/api/chat")).data,
  });

  const { mutate: deleteChat, isPending: isDeletingChat } = useMutation({
    mutationFn: async ({ chatId }: { chatId: string }) => {
      const { data } = await axios.delete(`/api/chat`, {
        data: { chatId },
      });
      return data;
    },
  });

  // const { mutate: deleteFile } = useMutation({
  //   onSuccess: () => {
  //     console.log('onSuccess')
  //    setShowAlert(true)
  //   },
  //   onMutate({ id }: { id: any }) {
  //     console.log('onMutate', id)
  //     setCurrentlyDeletingFile(id)
  //     setShowAlert(true)
  //   },
  //   onSettled() {
  //     console.log('onSettled')
  //     setCurrentlyDeletingFile(null)
  //   },
  // })

  const handleFileDeletion = (id: string) => {
    setCurrentlyDeletingFile(id);
    setShowAlert(true);
  };


  // First, update the ConfirmDialog component
const ConfirmDialog = () => {
  return (
    <Dialog
      open={showAlert}
      onOpenChange={(b) => {
        if (!isDeletingChat) {
          setShowAlert(b);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete File</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this file?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowAlert(false);
            }}
            disabled={isDeletingChat}
          >
            No
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deleteChat(
                { chatId: currentlyDeletingFile! },
                {
                  onSuccess: async (data) => {
                    console.log("file delete:", data);
                    setShowAlert(false);
                    await queryClient.invalidateQueries({ queryKey: [""] });
                    toast.success("File deleted successfully");
                  },
                  onError: (error) => {
                    console.log("delete mutation", error);
                    toast.error("Unable to delete file");
                    setShowAlert(false);
                  },
                }
              );
            }}
            disabled={isDeletingChat}
          >
            {isDeletingChat ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Yes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl md:p-10 w-full">
        {/* Header Skeleton */}
        <div className="mt-0 flex flex-col items-center justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
          <Skeleton className="h-12 w-48 mb-3" /> {/* Title skeleton */}
          <Skeleton className="h-10 w-32" /> {/* Upload button skeleton */}
        </div>

        {/* File List Skeleton */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white dark:bg-slate-800 shadow p-4"
            >
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8" /> {/* File icon skeleton */}
                <Skeleton className="h-6 w-full" /> {/* Filename skeleton */}
              </div>
              <div className="pt-4 mt-4 grid grid-cols-3 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl md:p-10 w-full">
      <div className="mt-0 flex flex-col items-center justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
      <h3 className="mb-3 font-bold text-5xl relative group cursor-default
        bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500 bg-clip-text text-transparent
        transition-all duration-300">
        My Documents
        <span className="absolute bottom-0 left-0 w-0 h-1 
          bg-gradient-to-r from-blue-600 via-blue-500 to-purple-500
          transition-all duration-300 group-hover:w-full"></span>
      </h3>
        <FileUpload isSubscribed={subscriptionPlan.isSubscribed} />
      </div>

      {/* display all user files */}
      {files && files?.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className="group col-span-1 rounded-xl bg-white dark:bg-slate-800 shadow-md 
            transition-all duration-300 ease-in-out 
            hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 
            dark:hover:shadow-white/10"
              >
                <Link
                  href={`/chat/${file.id}:${file.checksum}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center space-x-6">
                    <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0 relative group/tooltip">
                      {" "}
                      {/* Added min-w-0 for proper truncation */}
                      <div className="flex items-center">
                        <h3
                          className="text-lg font-medium text-zinc-900 dark:text-zinc-300 
        truncate transition-colors duration-200 
        group-hover:text-blue-500 dark:group-hover:text-blue-400"
                        >
                          {file.fileName}
                        </h3>
                      </div>
                      {/* Enhanced tooltip */}
                      <div
                        className="absolute -top-12 left-1/2 -translate-x-1/2 w-auto max-w-sm px-3 py-2 
      rounded-md bg-black/80 text-white text-sm opacity-0 
      group-hover/tooltip:opacity-100 transition-opacity duration-300
      pointer-events-none whitespace-normal break-words z-10"
                      >
                        {file.fileName}
                        <div
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full 
        border-4 border-transparent border-t-black/80"
                        ></div>
                      </div>
                    </div>
                  </div>
                </Link>

                <div
                  className="px-6 mt-4 grid grid-cols-3 place-items-center py-4 gap-6 
            text-sm text-zinc-500 dark:text-zinc-400 
            border-t border-zinc-100 dark:border-zinc-700/50"
                >
                  <div className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
                    <Plus className="h-4 w-4" />
                    {format(new Date(file.createdAt), "MMM yyyy")}
                  </div>

                  <div className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
                    <MessageSquare className="h-4 w-4" />
                    {file.messages.length}
                  </div>

                  <Button
                    onClick={() => handleFileDeletion(file.id)}
                    size="sm"
                    className="w-full transition-all duration-200 
                opacity-70 hover:opacity-100 hover:scale-105"
                    variant="destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="col-span-1 rounded-xl bg-white dark:bg-slate-800 shadow-md p-6 
          animate-pulse transition-all duration-300 ease-in-out"
            >
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="mt-6 pt-4 grid grid-cols-3 gap-4 border-t border-zinc-100 dark:border-zinc-700/50">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-4 animate-fadeIn">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-75 blur-sm animate-pulse" />
            <div className="relative rounded-full p-4 bg-white dark:bg-slate-800">
              <Ghost className="h-8 w-8 text-zinc-800 dark:text-zinc-200 animate-float" />
            </div>
          </div>
          <h3 className="font-semibold text-2xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Pretty empty around here
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
            Let&apos;s upload your first PDF and start exploring your documents.
          </p>
          <Button
            onClick={() => document.getElementById("file-upload")?.click()}
            className="mt-2 transition-all duration-300 hover:scale-105"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload a PDF
          </Button>
        </div>
      )}
      <ConfirmDialog />
    </main>
  );
};

export default Dashboard;

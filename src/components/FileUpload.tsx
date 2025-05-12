"use client";
import { useMutation } from "@tanstack/react-query";
import { Cloud, File, Inbox, Loader2, Plus } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Accept, useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Progress } from "./ui/progress";
import { cn, getFileMetadata, uploadFileToS3 } from "@/lib/utils";
import { PLANS } from "@/config/pricing";
import { Upload } from "@aws-sdk/lib-storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // file upload dialog
  const [showAlert, setShowAlert] = useState(false);
  const [upload, setUpload] = useState<Upload | null>(null);
  const [upload2, setUpload2] = useState<AbortController | null>(null);
  const [fileKey, setFileKey] = useState("");
  const [isAbortFileCreation, setAbort] = useState(false);
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const {
    mutate,
    isPending,
    reset: createReset,
  } = useMutation({
    mutationFn: async ({
      fileKey,
      fileName,
      fileType,
      checksum,
    }: {
      fileKey: string;
      fileName: string;
      fileType: string;
      checksum: string;
    }) => {
      const { data } = await axios.post("/api/chat/create", {
        fileKey,
        fileName,
        fileType,
        checksum,
      });
      return data;
    },
  });
  const {
    mutate: deleteChat,
    isPending: isDeletingChat,
    reset,
  } = useMutation({
    mutationFn: async ({ fileKey }: { fileKey: string }) => {
      const { data } = await axios.delete(
        `/api/chat/${encodeURIComponent(fileKey)}`
      );
      return data;
    },
  });

  const plan = PLANS.find((p) => p.slug === "free");
  const fileSize = plan!.fileSize || 5; // default to 5MB
  const fileTypes = plan!.fileTypes || { "application/pdf": [".pdf"] };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setAbort(false);
      setAcceptedFiles([...acceptedFiles]);
      const file = acceptedFiles[0];
      if (file.size > fileSize * 1024 * 1024) {
        toast.error("please upload a smaller file");
        return;
      }

      const { fileType } = getFileMetadata(file.name);

      if (!Object.keys(fileTypes).includes(fileType || "")) {
        toast.error("Unsupported file type");
        return;
      }

      try {
        setUploading(true);
        console.log("uploading");
        // const data = await uploadToS3({ file, fileExtension: fileExtension ?? '' }, setProgress, abortUpload)
        const data = await uploadFileToS3(file, setProgress, abortUpload2);
        if (!data) {
          toast.error("Error while uploading file. Try again");
          return;
        }
        setFileKey(data.fileKey);

        mutate(
          { fileType: fileType ?? "", ...data },
          {
            onSuccess: ({ id, checksum }) => {
              if (!isAbortFileCreation) {
                router.push(`/chat/${id}:${checksum}`);
              }
            },
            onError: (error) => {
              setUploading(false);
              console.log(error);
              if (!isAbortFileCreation) {
                toast.error("Error creating chat");
              }
            },
          }
        );
      } catch (error) {
        console.log(error);
        toast.error("Error uploading file");
      }
    },
    [acceptedFiles]
  );

  const { getRootProps, getInputProps, inputRef } = useDropzone({
    accept: fileTypes as Accept,
    maxFiles: 1,
    onDrop,
  });

  const abortUpload = async (upload: Upload) => {
    setUpload(upload);
  };

  const abortUpload2 = async (upload: AbortController) => {
    setUpload2(upload);
  };

  const cancleOngoingUplaod = async (cancel: boolean) => {
    if (cancel) {
      setAbort(true);
      try {
        if (progress < 100) {
          await upload?.abort();
          setUploading(false);
          setProgress(0);
          setAcceptedFiles([]);
          reset();
          createReset();
        } else if (fileKey) {
          deleteChat(
            { fileKey },
            {
              onSuccess: (data) => {
                console.log("delete file", { data });
                setUploading(false);
                setProgress(0);
                setAcceptedFiles([]);
                reset();
                createReset();
              },
              onError: (error) => {
                setUploading(false);
                console.log(error);
                // toast.error('Error deleting chat')
              },
            }
          );
        }
      } catch (err) {}
      setIsOpen(false);
    }
    setShowAlert(false);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(v) => {
          if (!v && uploading) {
            // If dialog is being closed and an upload is ongoing, show the alert dialog
            setShowAlert(true);
          } else if (!v && !uploading) {
            // If dialog is being closed and no upload is ongoing, close the main dialog
            setIsOpen(false);
            setShowAlert(false);
          }
        }}
      >
        <DialogTrigger onClick={() => setIsOpen(true)} asChild>
          <Button
            className="relative group overflow-hidden transform transition-all duration-200 
        hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            <div
              className="absolute inset-0 w-0 bg-gradient-to-r from-blue-500 to-purple-500 
            transition-all duration-300 ease-out group-hover:w-full opacity-20"
            />
            <span className="relative flex items-center gap-2">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-12" />
              Upload Document
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent>
          <div className="w-full">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl">
              <div
                {...getRootProps({
                  className: cn(
                    "border border-dashed border-gray-300 rounded-xl bg-gray-50 dark:bg-slate-900 py-8 px-8 flex justify-center items-center flex-col w-full h-full",
                    {
                      "cursor-pointer": uploading === false,
                    }
                  ),
                })}
              >
                <input {...getInputProps()} />
                {acceptedFiles && acceptedFiles[0] ? (
                  <div className="max-w-xs bg-white dark:bg-slate-900 flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 dark:outline-zinc-500 divide-x divide-zinc-200 dark:divide-zinc-500 mb-5">
                    <div className="px-3 py-2 h-full grid place-items-center">
                      <File className="h-4 w-4" />
                    </div>
                    <div className="px-3 py-2 h-full text-sm truncate">
                      {acceptedFiles[0].name}
                    </div>
                  </div>
                ) : null}
                {isPending || uploading ? (
                  <>
                    <Progress
                      value={progress}
                      className={cn(
                        "w-[100%] h-2 mt-1 mb-1 bg-zinc-200 dark:bg-slate-900",
                        {
                          "bg-green-500": progress === 100,
                        }
                      )}
                    />
                    {progress === 100 ? (
                      <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 dark:text-zinc-200 text-center pt-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Redirecting...
                      </div>
                    ) : (
                      <small>{progress}%</small>
                    )}
                  </>
                ) : (
                  <>
                    <Inbox className="w-10 h-10 text-blue-500" />
                    <p className="mt-2 text-sm text-slate-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop here
                    </p>
                    <p className="text-xs text-zinc-500">
                      {Object.values(fileTypes).flat().join(",")} (up to{" "}
                      {fileSize}MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showAlert}
        onOpenChange={(b) => {
          console.log(b);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ongoing upload</DialogTitle>
            <DialogDescription>
              Will you like to cancel the current upload?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={async () => {
                await cancleOngoingUplaod(false);
              }}
            >
              No
            </Button>
            <Button
              variant="destructive"
              onClick={async () => await cancleOngoingUplaod(true)}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileUpload;

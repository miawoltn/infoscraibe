'use client'
import { uploadToS3 } from '@/lib/s3'
import { useMutation } from '@tanstack/react-query'
import { Cloud, File, Inbox, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Progress } from './ui/progress'
import { cn } from '@/lib/utils'


const FileUpload = ({
    isSubscribed,
}: {
    isSubscribed: boolean
}) => {
    const router = useRouter()
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0)
    const { mutate, isPending } = useMutation({
        mutationFn: async ({ file_key, file_name }: { file_key: string, file_name: string }) => {
            const { data } = await axios.post('/api/create-chat', { file_key, file_name })
            return data
        }
    })
    const fileSize = isSubscribed ? 16 : 4;

    const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            console.log(acceptedFiles)
            const file = acceptedFiles[0]
            if (file.size > fileSize * 1024 * 1024) {
                toast.error('please upload a smaller file')
                return
            }

            try {
                setUploading(true)
                const data = await uploadToS3(file, setProgress)
                if (!data?.file_key || !data.file_name) {
                    return
                }

                mutate(data, {
                    onSuccess: (data) => {
                        router.push(`/chat/${data.chat_id}`)
                    },
                    onError: (error) => {
                        setUploading(false)
                        console.log(error)
                        toast.error('Error creating chat')
                    }
                })
            } catch (error) {
                console.log(error)
                toast.error('Error uploading file')
            }
        }
    })
    return (
        <div className='p-2 bg-white rounded-xl'>
            <div {...getRootProps({
                className: cn('border border-dashed border-gray-300 rounded-xl bg-gray-50 py-8 px-8 flex justify-center items-center flex-col w-full h-full', {
                    "cursor-pointer": uploading === false
                }),
            })}>
                <input {...getInputProps()} />
                {acceptedFiles && acceptedFiles[0] ? (
                    <div className='max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200 mb-5'>
                        <div className='px-3 py-2 h-full grid place-items-center'>
                            <File className='h-4 w-4' />
                        </div>
                        <div className='px-3 py-2 h-full text-sm truncate'>
                            {acceptedFiles[0].name}
                        </div>
                    </div>
                ) : null}
                {isPending || uploading ?
                    (
                        <>
                            <Progress
                                value={progress}
                                className={cn("w-[100%] h-2 mt-1 mb-1 bg-zinc-200", {
                                    'bg-green-500': progress === 100
                                })} />
                            {progress === 100 ? (
                                <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2'>
                                    <Loader2 className='h-3 w-3 animate-spin' />
                                    Redirecting...
                                </div>
                            ) : <small>{progress}%</small>}
                        </>
                    ) :
                    (<>
                        <Inbox className='w-10 h-10 text-blue-500' />
                        <p className="mt-2 text-sm text-slate-400">
                            <span className='font-semibold'>
                                Click to upload
                            </span>{' '}
                            or drag and drop here
                        </p>
                        <p className='text-xs text-zinc-500'>
                            PDF (up to {fileSize}MB)
                        </p>
                    </>)
                }
            </div>
        </div>
    )
}

export default FileUpload
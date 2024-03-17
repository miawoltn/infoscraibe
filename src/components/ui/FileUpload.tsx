'use client'
import { uploadToS3 } from '@/lib/s3'
import { useMutation } from '@tanstack/react-query'
import { Inbox, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import {useDropzone} from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'


const FileUpload = () => {
    const router  = useRouter()
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0)
    const {mutate, isPending} = useMutation({
        mutationFn: async ({file_key, file_name}: { file_key: string, file_name: string}) => {
            const { data } = await axios.post('/api/create-chat', { file_key, file_name })
            return data
        }
    })
    const {getRootProps, getInputProps} = useDropzone({
        accept: { "application/pdf": [".pdf"]},
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            console.log(acceptedFiles)
            const file = acceptedFiles[0]
            if(file.size > 10 * 1024 * 1024) {
                toast.error('please upload a smaller file')
                return
            }

            try {
                setUploading(true)
                const data = await uploadToS3(file)
                if(!data?.file_key || !data.file_name) {
                    return
                }

                mutate(data, {
                    onSuccess: (data) => {
                        setUploading(false)
                        console.log(data)
                        toast.success(data.message)
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
            }
        }
    })
  return (
    <div className='p-2 bg-white rounded-xl'>
        <div {...getRootProps({
            className: 'border-dashed rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col'
        })}>
            <input {...getInputProps()} />
            {isPending || uploading ? 
            (
                <>
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                    <p className="mt-2 text-sm text-slate-400">
                    Spilling Tea to GPT...
                    </p>
                </>
            ) :
           ( <>
            <Inbox className='w-10 h-10 text-blue-500' />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
            </>)
        }
        </div>
    </div>
  )
}

export default FileUpload
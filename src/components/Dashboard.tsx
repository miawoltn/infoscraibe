'use client'

import {
  FileText,
  Ghost,
  Loader2,
  MessageSquare,
  Plus,
  Trash,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from './ui/button'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import FileUpload from './FileUpload'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import toast from 'react-hot-toast'
import { Skeleton } from './ui/skeleton'

interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const Dashboard = ({ subscriptionPlan }: PageProps) => {
  const [currentlyDeletingFile, setCurrentlyDeletingFile] =
    useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)

  const queryClient = useQueryClient()
  const { data: files, isLoading, refetch } = useQuery({
    queryKey: [''],
    queryFn: async () => (await axios.get<any[]>('/api/chat')).data
  });

  const { mutate: deleteChat, isPending: isDeletingChat } = useMutation({
    mutationFn: async ({ chatId }: { chatId: string }) => {
        const { data } = await axios.delete(`/api/chat`, {
          data: {chatId}
        })
        return data
    }
})

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
    setCurrentlyDeletingFile(id)
    setShowAlert(true)

  }

  const ConfirmDialog = () => {
    return (
      <Dialog open={showAlert} onOpenChange={(b) => { console.log(b) }}>
      <DialogContent>
          <DialogHeader>
              <DialogTitle>Delete File</DialogTitle>
              <DialogDescription>
                  Are you sure you want to delete this file?
              </DialogDescription>
          </DialogHeader>
          <DialogFooter>
              <Button variant='outline' onClick={() => { setShowAlert(false) }}>No</Button>
              <Button variant='destructive' onClick={() => {
                 deleteChat({ chatId: currentlyDeletingFile! }, {
                  onSuccess: async (data) => {
                    console.log('file delete:', data)
                    setShowAlert((curr) => false)
                    await queryClient.invalidateQueries({queryKey:['']})
                  },
                  onError: (error) => {
                      console.log('delete mutation', error)
                     toast.error('Unable to delete file');
                     setShowAlert(false)
                  }
              })
              }}>Yes</Button>
          </DialogFooter>
      </DialogContent>
  </Dialog>
    )
  }

  if (isLoading) {
    return (
      // <div className="grid h-screen w-screen place-items-center">
      //   <Loader2 className='w-6 h-6 animate-spin' />
      // </div>
        <Skeleton className='m-5 h-60 w-screen'/>
    )
  }

  return (
    <main className='mx-auto max-w-7xl md:p-10 w-full'>
      <div className='mt-0 flex flex-col items-center justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
        <h3 className='mb-3 font-bold text-5xl text-gray-900 dark:text-gray-300'>
          My Documents
        </h3>
        <FileUpload isSubscribed={subscriptionPlan.isSubscribed} />
      </div>

      {/* display all user files */}
      {files && files?.length !== 0 ? (
        <ul className='mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 dark:divide-zinc-500 md:grid-cols-2 lg:grid-cols-3'>
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className='col-span-1 divide-y divide-gray-200 rounded-lg bg-white dark:bg-slate-800 shadow transition hover:shadow-lg dark:hover:shadow-white/10'>
                <Link
                  href={`/chat/${file.id}:${file.checksum}`}
                  className='flex flex-col gap-2'>
                  <div className='pt-6 px-6 flex w-full items-center justify-between space-x-6'>
                    {/* <div className='h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500' /> */}
                    <FileText />
                    <div className='flex-1 truncate'>
                      <div className='flex items-center space-x-3 overflow-x-hidden'>
                        <h3 className='text-lg font-medium text-zinc-900 dark:text-zinc-300 overflow-scroll'>
                          {file.fileName}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className='px-5 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500 dark:text-zinc-300'>
                  <div className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    {format(
                      new Date(file.createdAt),
                      'MMM yyyy'
                    )}
                  </div>

                  <div className='flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4' />
                    {file.messages.length}
                  </div>

                  <Button
                    onClick={() =>
                      // deleteFile({ id: file.id })
                      handleFileDeletion(file.id)
                    }
                    size='sm'
                    className='w-full hover:scale-105'
                    variant='destructive'>
                    <Trash className='h-4 w-4' />
                    {/* {currentlyDeletingFile == file.id+"" ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Trash className='h-4 w-4' />
                    )} */}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton className='my-2 h-[100px]' />
      ) : (
        <div className='mt-16 flex flex-col items-center gap-2'>
          <Ghost className='h-8 w-8 text-zinc-800 dark:text-zinc-200' />
          <h3 className='font-semibold text-xl'>
            Pretty empty around here
          </h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      )}
      <ConfirmDialog />
    </main>
  )
}

export default Dashboard
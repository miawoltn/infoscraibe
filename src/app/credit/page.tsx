'use client'

import { CreditsDashboard } from '@/components/CreditsDashboard'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2 } from 'lucide-react'

function CreditsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      const response = await axios.get('/api/credits')
      return response.data
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto p-8">
          <h1 className="text-2xl font-bold mb-8">Credits & Usage</h1>
          <CreditsDashboard 
            credits={Number(data?.credits || 0)}
            threshold={Number(data?.threshold || 100)}
            usageHistory={data?.usageHistory || []}
          />
        </div>
      </div>
    </div>
  )
}

export default (CreditsPage)
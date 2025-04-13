'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <Card className="w-full max-w-md p-8 space-y-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <XCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-bold">Authentication Error</h1>
        
        <p className="text-muted-foreground">
          {error || "Something went wrong during authentication."}
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/sign-in">
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Suspense fallback={
        <Card className="w-full max-w-md p-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          </div>
        </Card>
      }>
        <ErrorContent />
      </Suspense>
    </div>
  )
}
'use client'

import { AuthContext } from '@/lib/auth/utils/context'
import { set } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any | null>(null)
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const reload = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setUser(data.user)
      setIsSignedIn(data.user !== null)

      // Set the session status in local storage
      // This is used to trigger a reload in the client
      // when the user signs in or out
      // This is a workaround for the fact that Next.js does not
      // support client-side session management
      // in the same way as NextAuth.js
      if (data.user) {
        localStorage.setItem('auth-session-status', 'signed-in')
      }
      else {
        localStorage.removeItem('auth-session-status')
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error)
      setUser(null)
      setIsSignedIn(null)
      localStorage.removeItem('auth-session-status')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if(!user || isSignedIn === null) {
      // If the user is not signed in, reload the session
      // to get the latest user data
      reload()
    }
    // Listen for authentication events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-session-status') {
        reload()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [reload, user, isSignedIn])

  return (
    <AuthContext.Provider value={{ user, isSignedIn, isLoading, reload }}>
      {children}
    </AuthContext.Provider>
  )
}
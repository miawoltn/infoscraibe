'use client'

import { createContext, useContext, useEffect, useState } from 'react'
// import { AuthUser } from '../../db'

type AuthContextType = {
  user: any | null
  isSignedIn: boolean | null
  isLoading: boolean
  reload: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isSignedIn: null,
  isLoading: true,
  reload: async () => {},
})

const useAuth = () => useContext(AuthContext)

export { AuthContext, useAuth }
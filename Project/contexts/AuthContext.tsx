// contexts/AuthContext.tsx
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

type AuthContextType = {
  user: any | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  login: (email: string, password: string) => Promise<any>,
  logout: () => Promise<any>,
  register: (name: string, email: string, password: string) => Promise<any>,
  openAuthModal: () => void, // Add this method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  
  const isLoading = status === "loading"
  const isAuthenticated = !!session
  
  // Add your authentication functions here...
  const login = async (email: string, password: string) => {
    // Your login implementation
    return signIn("credentials", { email, password, redirect: false })
  }
  
  const logout = async () => {
    // Your logout implementation
    return signOut({ redirect: false })
  }
  
  const register = async (name: string, email: string, password: string) => {
    // Your registration implementation  
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    return response.json()
  }
  
  // Add this new function to open the auth modal
  const openAuthModal = () => {
    setIsAuthModalOpen(true)
  }
  
  // Update effect to watch isAuthModalOpen and show the modal
  useEffect(() => {
    if (isAuthModalOpen) {
      // If you have a global modal state setter, use it here
      // For example, if you use a global store or a context:
      // setGlobalAuthModalOpen(true)
      
      // Or, if you're using a different approach for modals:
      document.dispatchEvent(new CustomEvent('open-auth-modal'))
    }
  }, [isAuthModalOpen])
  
  return (
    <AuthContext.Provider value={{
      user: session?.user || null,
      isAuthenticated,
      isLoading,
      login,
      logout,
      register,
      openAuthModal // Add the new method
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
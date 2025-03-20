"use client"

import { createContext, useContext, ReactNode } from "react"
// import { useSession, signOut } from "next-auth/react"
import { Session } from "next-auth"
import { useSession } from "next-auth/react"
import { signIn, signOut } from "next-auth/react"

type User = {
  id?: number | string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
}

interface ExtendedSession extends Session {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    // Optional fields that might not exist in the session
    id?: string | number
    role?: string
  }
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (userData: User, token?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null,
    status: "loading" | "authenticated" | "unauthenticated"
  }

  // Combine NextAuth session with custom JWT login
  const isAuthenticated = status === "authenticated" || localStorage.getItem("token") !== null

  // Combine user data from NextAuth and your custom JWT
  let user: User | null = null

  if (session?.user) {
    // User from NextAuth session
    user = {
      id: session.user.id || session.user.email || "",
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role || "BUYER" // Default role
    }
  } else if (localStorage.getItem("token")) {
    // Try to get user data from localStorage if available
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        user = JSON.parse(storedUser)
      }
    } catch (error) {
      console.error("Failed to parse stored user data", error)
    }
  }

  const login = (userData: User, token?: string) => {
    if (token) {
      localStorage.setItem("token", token)
    }
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Also sign out from NextAuth
    signOut({ redirect: false })
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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
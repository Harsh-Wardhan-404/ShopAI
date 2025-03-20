"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface SignupFormProps {
  onSuccess: () => void
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Submitting signup form...")
      // Using fetch with absolute URL to ensure correct path
      const response = await fetch(`${window.location.origin}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      console.log("Response status:", response.status)

      // Try to parse the response
      let data
      try {
        const textResponse = await response.text()
        console.log("Raw response:", textResponse)
        data = textResponse ? JSON.parse(textResponse) : {}
        console.log("Response data:", data)
      } catch (err) {
        console.error("Error parsing response:", err)
        throw new Error("Invalid server response")
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.details || `Signup failed with status: ${response.status}`)
      }

      toast({
        title: "Account created!",
        description: "You can now login with your credentials",
        duration: 5000,
      })

      // Clear the form
      setName('')
      setEmail('')
      setPassword('')

      // Move to login tab
      onSuccess()
    } catch (error: any) {
      console.error("Signup error:", error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong during signup",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Sign up"}
      </Button>
    </form>
  )
}

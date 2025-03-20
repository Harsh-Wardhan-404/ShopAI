"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/auth/AuthModal"

export default function SiteHeader() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <header className="py-4 px-6 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">shop.ai</h2>
        <Button
          variant="ghost"
          onClick={() => setIsAuthModalOpen(true)}
          className="hover:text-primary"
        >
          Login
        </Button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </header>
  )
}

"use client"

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previousPath, setPreviousPath] = useState('')

  useEffect(() => {
    // Store the current path+query
    const currentPath = pathname + (searchParams ? searchParams.toString() : '')

    // If it's different from previous path, we're navigating
    if (previousPath && previousPath !== currentPath) {
      // Start progress
      setIsNavigating(true)
      setProgress(20)

      // Simulate progress
      const timer1 = setTimeout(() => setProgress(60), 100)
      const timer2 = setTimeout(() => setProgress(80), 180)

      // Complete navigation
      const timer3 = setTimeout(() => {
        setProgress(100)
        setTimeout(() => {
          setIsNavigating(false)
          setProgress(0)
        }, 200)
      }, 250)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }

    // Update previous path for next comparison
    setPreviousPath(currentPath)
  }, [pathname, searchParams, previousPath])

  if (!isNavigating) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
      <div
        className="h-full bg-primary transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
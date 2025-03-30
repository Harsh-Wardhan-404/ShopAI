// components/products/ProductViewTracker.tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ProductViewTrackerProps {
  productId: number;
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Only track for authenticated users
    if (!isAuthenticated) return;
    
    // Track after a short delay to ensure it's an actual view
    const timer = setTimeout(() => {
      fetch("/api/tracking/product-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      }).catch(err => console.error("Error tracking product view:", err));
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [productId, isAuthenticated]);
  
  // This component doesn't render anything
  return null;
}
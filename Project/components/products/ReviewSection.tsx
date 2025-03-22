// components/products/ReviewSection.tsx
"use client";

import { useState, useEffect } from "react";
import { ReviewList } from "./ReviewList";
import { ReviewForm } from "./ReviewForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewSectionProps {
  productId: number;
  canReview: boolean;
  initialCanReview?: boolean;
}

export function ReviewSection({
  productId,
  canReview,
  initialCanReview = false
}: ReviewSectionProps) {

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isAuthenticated, openAuthModal, user } = useAuth();
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const handleReviewAdded = () => {
    // Increment the trigger to cause a refresh
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Log authentication state for debugging
    console.log("Auth state:", { isAuthenticated, user, canReview });
  }, [isAuthenticated, user, canReview]);

  return (
    <div className="space-y-8">
      <ReviewList
        productId={productId}
        refreshTrigger={refreshTrigger}
      />

      {/* Toggle debug info */}
      <div className="text-right">
        <button
          className="text-xs text-muted-foreground"
          onClick={() => setShowDebugInfo(!showDebugInfo)}
        >
          {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
        </button>
      </div>

      {/* Debug information */}
      {showDebugInfo && (
        <div className="bg-muted p-4 text-xs rounded-md">
          <p>isAuthenticated: {String(isAuthenticated)}</p>
          <p>canReview: {String(canReview)}</p>
          <p>User: {user ? JSON.stringify(user) : "Not logged in"}</p>
        </div>
      )}

      {isAuthenticated ? (
        // Show the review form for authenticated users, overriding canReview for testing
        <ReviewForm
          productId={productId}
          onReviewAdded={handleReviewAdded}
          canReview={canReview} // Use allowReview instead of canReview
        />
      ) : (
        // Login prompt for unauthenticated users
        <div className="border rounded-md p-4 mt-6 text-center">
          <p className="mb-2">Sign in to leave a review</p>
          <Button onClick={openAuthModal}>Sign In</Button>
        </div>
      )}

      {/* Fallback option - always show this for testing */}
      {!isAuthenticated && (
        <div className="mt-4 border-t pt-4">
          <p className="text-sm mb-2">Alternative sign-in options:</p>
          <Button asChild className="w-full">
            <a href="/api/auth/signin">Sign in using NextAuth</a>
          </Button>
        </div>
      )}
    </div>
  );
}
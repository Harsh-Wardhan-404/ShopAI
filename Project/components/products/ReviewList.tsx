"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    image: string | null;
  };
}

interface ReviewListProps {
  productId: number;
  refreshTrigger?: number;
}

export function ReviewList({ productId, refreshTrigger = 0 }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${productId}/reviews`);

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Could not load reviews. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        <h3 className="text-xl font-medium">Customer Reviews</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-md p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-medium mb-4">Customer Reviews</h3>
        <div className="border rounded-md p-6 text-center text-muted-foreground">
          No reviews yet. Be the first to review this product!
        </div>
      </div>
    );
  }

  // Calculate average rating
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium">Customer Reviews</h3>
        <div className="flex items-center">
          <div className="flex mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-5 h-5 ${star <= Math.round(averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                  }`}
              />
            ))}
          </div>
          <span className="font-medium">
            {averageRating.toFixed(1)} out of 5 ({reviews.length} reviews)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-md p-4">
            <div className="flex items-center mb-3">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={review.user.image || ""} alt={review.user.name} />
                <AvatarFallback>
                  {review.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{review.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-4 h-4 ${star <= review.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                    }`}
                />
              ))}
            </div>

            {review.comment && <p className="text-sm">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
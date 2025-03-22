"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, ThumbsUp, Meh } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

interface SentimentAnalysis {
  overall_sentiment: string;
  sentiment_score: number;
  avg_rating: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  summary: string;
}

interface ReviewListProps {
  productId: number;
  refreshTrigger?: number;
}

export function ReviewList({ productId, refreshTrigger = 0 }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);

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
        const fetchedReviews = data.reviews || [];
        setReviews(fetchedReviews);
        console.log("befor calling analyzeSentiment");
        if (fetchedReviews.length > 0) {
          await analyzeSentiment(fetchedReviews);
        }
        console.log("after calling analyzeSentiment");
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Could not load reviews. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId, refreshTrigger]);

  const analyzeSentiment = async (reviews: Review[]) => {
    if (reviews.length === 0) return;

    setIsSentimentLoading(true);
    try {
      // Use this endpoint if calling directly from Next.js
      const response = await fetch("/api/sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviews }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze sentiment");
      }

      const data = await response.json();
      setSentiment(data);
    } catch (err) {
      console.error("Error analyzing sentiment:", err);
    } finally {
      setIsSentimentLoading(false);
    }
  };

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

  const getSentimentIcon = () => {
    if (!sentiment) return <Meh className="h-5 w-5 text-gray-400" />;

    switch (sentiment.overall_sentiment) {
      case 'positive':
        return <ThumbsUp className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Meh className="h-5 w-5 text-amber-500" />;
    }
  };

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

      {sentiment && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center">
              {getSentimentIcon()}
              <span className="ml-2 font-medium">Review Summary:</span>
              <span className="ml-2">{sentiment.summary}</span>
            </div>
            <div className="flex mt-2 text-sm text-muted-foreground">
              <div className="mr-4">
                <span className="text-green-500 font-medium">{sentiment.positive_count}</span> positive
              </div>
              <div className="mr-4">
                <span className="text-amber-500 font-medium">{sentiment.neutral_count}</span> neutral
              </div>
              <div>
                <span className="text-red-500 font-medium">{sentiment.negative_count}</span> negative
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
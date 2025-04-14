"use client";

import { useState, useEffect, useRef } from "react";
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
  refreshing?: boolean;
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup polling timeout on unmount or when product changes
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [productId]);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch reviews
        const response = await fetch(`/api/products/${productId}/reviews`);

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();
        const fetchedReviews = data.reviews || [];
        setReviews(fetchedReviews);

        // Early return if there are no reviews - skip sentiment analysis
        if (fetchedReviews.length === 0) {
          setIsLoading(false);
          return;
        }

        // Only proceed with sentiment analysis if we have reviews
        // Try to get cached sentiment first
        const sentimentResponse = await fetch(`/api/products/${productId}/sentiment`);
        const cachedSentiment = await sentimentResponse.json();

        if (cachedSentiment && !cachedSentiment.error) {
          console.log("Using cached sentiment analysis");
          setSentiment(cachedSentiment);

          // Check if sentiment is refreshing in the background
          if (cachedSentiment.refreshing) {
            setIsRefreshing(true);
            pollForUpdatedSentiment();
          } else {
            setIsRefreshing(false);
          }
        } else if (fetchedReviews.length > 0) {
          // If no cached sentiment, generate a new one directly
          console.log("No cached sentiment available, generating new sentiment analysis");
          await analyzeSentiment(fetchedReviews);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Could not load reviews. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId, refreshTrigger]);

  const pollForUpdatedSentiment = async () => {
    try {
      console.log('Polling for updated sentiment analysis');
      const response = await fetch(`/api/products/${productId}/sentiment`);

      if (!response.ok) {
        console.error('Failed to poll for updated sentiment');
        setIsRefreshing(false);
        return;
      }

      const data = await response.json();

      // If we got sentiment data and it's different from what we have
      if (data && !data.error) {
        // Compare to see if it's different
        const isSentimentDifferent = !sentiment ||
          sentiment.summary !== data.summary ||
          sentiment.positive_count !== data.positive_count ||
          sentiment.negative_count !== data.negative_count ||
          sentiment.neutral_count !== data.neutral_count;

        if (isSentimentDifferent) {
          console.log('Found updated sentiment analysis, refreshing UI');
          setSentiment(data);
        }

        // Continue polling if still refreshing
        setIsRefreshing(!!data.refreshing);

        if (data.refreshing) {
          pollingTimeoutRef.current = setTimeout(pollForUpdatedSentiment, 3000);
        }
      } else {
        // Stop polling if we no longer get valid data
        setIsRefreshing(false);
      }
    } catch (error) {
      console.error('Error polling for updated sentiment:', error);
      setIsRefreshing(false);
    }
  };

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
        body: JSON.stringify({ reviews, productId }),
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
    // First check if we can already determine if there are no reviews
    if (reviews.length === 0 && isLoading && !error) {
      // If we've already fetched reviews but are still loading sentiment, 
      // we can show the "No reviews" message early
      return (
        <div className="mt-6">
          <h3 className="text-xl font-medium mb-4">Customer Reviews</h3>
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-6">
        <h3 className="text-xl font-medium">Customer Reviews</h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-md p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
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
    return (
      <div className="mt-6">
        <h3 className="text-xl font-medium mb-4">Customer Reviews</h3>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-medium mb-4">Customer Reviews</h3>
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

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
              {isRefreshing && (
                <div className="ml-auto flex items-center text-xs text-gray-500">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating analysis...</span>
                </div>
              )}
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
                <div className="font-medium">{review.user.name}</div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="ml-auto flex">
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
            </div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
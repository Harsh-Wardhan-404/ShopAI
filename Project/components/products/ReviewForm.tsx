
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ReviewFormProps {
  productId: number;
  onReviewAdded: () => void;
  canReview: boolean;
}

export function ReviewForm({ productId, onReviewAdded, canReview }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const { toast } = useToast();

  if (!canReview) {
    return (
      <div className="rounded-md bg-muted p-4 my-4">
        <p className="text-center text-muted-foreground">
          You need to purchase this product to leave a review.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
      }
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      
      setRating(0);
      setComment("");
      onReviewAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6 border rounded-md p-4">
      <h3 className="text-lg font-medium">Write a Review</h3>
      
      <div className="flex items-center">
        <p className="mr-2">Your Rating:</p>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              className="focus:outline-none"
            >
              <StarIcon
                className={`w-6 h-6 ${
                  star <= (hoveredStar || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="comment" className="block mb-2 text-sm font-medium">
          Your Review
        </label>
        <Textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          className="resize-none"
        />
      </div>
      
      <Button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
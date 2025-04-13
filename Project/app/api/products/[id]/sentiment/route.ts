// app/api/products/[id]/sentiment/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";

// Special key to track background sentiment analysis tasks
const activeSentimentTasks = new Set<number>();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    // Get review count to check if we need to regenerate
    const reviewCount = await prisma.review.count({
      where: { productId }
    });

    // Try to get cached sentiment
    const cachedSentiment = await prisma.sentimentSummary.findUnique({
      where: { productId }
    });

    // Check if sentiment needs refresh (outdated or doesn't exist)
    const needsRefresh =
      !cachedSentiment ||
      cachedSentiment.reviewCount !== reviewCount;

    // If the sentiment needs a refresh and there's no active task, trigger background update
    if (needsRefresh && !activeSentimentTasks.has(productId)) {
      console.log(`Triggering background sentiment analysis for product ${productId}`);
      // Get all reviews for this product
      const reviews = await prisma.review.findMany({
        where: { productId },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });

      // Trigger background sentiment analysis
      updateSentimentInBackground(productId, reviews);
    }

    // Always return the cached sentiment (if exists), even if it's outdated
    if (cachedSentiment) {
      return NextResponse.json({
        ...cachedSentiment,
        refreshing: needsRefresh
      });
    }

    // If no cached sentiment exists, return a basic rating-based analysis while we generate a full one
    // This ensures users always see something immediately
    const ratings = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    if (ratings.length > 0) {
      const avgRating = ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;
      const basicSentiment = {
        overall_sentiment: avgRating >= 4 ? "positive" : avgRating >= 3 ? "neutral" : "negative",
        sentiment_score: avgRating >= 4 ? 0.7 : avgRating >= 3 ? 0 : -0.7,
        avg_rating: avgRating,
        positive_count: ratings.filter((r) => r.rating >= 4).length,
        neutral_count: ratings.filter((r) => r.rating === 3).length,
        negative_count: ratings.filter((r) => r.rating <= 2).length,
        summary: `Based on ${ratings.length} ratings with an average of ${avgRating.toFixed(1)} stars.`,
        refreshing: true
      };

      return NextResponse.json(basicSentiment);
    }

    // If no reviews at all, return null
    return NextResponse.json(null);
  } catch (error) {
    console.error("Error fetching sentiment summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch sentiment summary" },
      { status: 500 }
    );
  }
}

// Function to update sentiment analysis in the background
async function updateSentimentInBackground(productId: number, reviews: any[]) {
  // If this product is already being processed, don't start a new task
  if (activeSentimentTasks.has(productId)) {
    console.log(`Sentiment analysis for product ${productId} already in progress, skipping`);
    return;
  }

  try {
    // Mark this product as being processed
    activeSentimentTasks.add(productId);

    // Use setTimeout with 0 to not block the response
    setTimeout(async () => {
      try {
        console.log(`Background sentiment analysis: Starting for product ${productId}`);

        // Use absolute URL for server-side fetch
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000';
        const apiUrl = `${protocol}://${host}/api/sentiment`;

        console.log(`Using API URL: ${apiUrl}`);

        // Call the sentiment analysis API
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviews,
            productId,
            background: true // Flag to indicate this is a background process
          }),
        });

        if (!response.ok) {
          throw new Error(`Sentiment API returned ${response.status}`);
        }

        console.log(`Background sentiment analysis: Completed for product ${productId}`);
      } catch (error) {
        console.error(`Background sentiment analysis: Failed for product ${productId}:`, error);
      } finally {
        // Always remove from active tasks when done, regardless of success or failure
        activeSentimentTasks.delete(productId);
      }
    }, 0);
  } catch (error) {
    // Remove from active tasks if the setup fails
    activeSentimentTasks.delete(productId);
    console.error(`Failed to initialize background sentiment analysis for product ${productId}:`, error);
  }
}
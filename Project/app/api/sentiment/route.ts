import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper class for Ollama rate limiting
class OllamaRateLimiter {
  private static instance: OllamaRateLimiter;
  private queue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    fn: () => Promise<any>;
  }> = [];
  private processing = false;
  private lastRequestTime = 0;
  private requestDelayMs = 2000; // 2 seconds between requests

  private constructor() { }

  public static getInstance(): OllamaRateLimiter {
    if (!OllamaRateLimiter.instance) {
      OllamaRateLimiter.instance = new OllamaRateLimiter();
    }
    return OllamaRateLimiter.instance;
  }

  public async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ resolve, reject, fn });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.requestDelayMs) {
      const delay = this.requestDelayMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const next = this.queue.shift();
    if (next) {
      this.lastRequestTime = Date.now();
      try {
        const result = await next.fn();
        next.resolve(result);
      } catch (error) {
        next.reject(error);
      }
    }

    // Continue processing the queue after a delay
    setTimeout(() => this.processQueue(), 100);
  }
}

// Create a singleton instance
const ollamaRateLimiter = OllamaRateLimiter.getInstance();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reviews = body.reviews || [];
    const productId = body.productId;
    const isBackground = !!body.background;

    // Calculate accurate counts based on the actual reviews
    const actualReviewCount = reviews.length;

    // Calculate average rating
    const ratings = reviews.map((review: any) => review.rating || 0);
    const avgRating = ratings.length > 0
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : 0;

    // Extract comments for analysis
    const comments = reviews
      .filter((r: any) => r.comment)
      .map((r: any) => r.comment);

    if (comments.length === 0) {
      // If no comments, return basic stats based on ratings
      const basicAnalysis = {
        overall_sentiment: avgRating >= 4 ? "positive" : avgRating >= 3 ? "neutral" : "negative",
        sentiment_score: avgRating >= 4 ? 0.7 : avgRating >= 3 ? 0 : -0.7,
        avg_rating: avgRating,
        positive_count: ratings.filter((r: number) => r >= 4).length,
        neutral_count: ratings.filter((r: number) => r === 3).length,
        negative_count: ratings.filter((r: number) => r <= 2).length,
        summary: `Product has ${ratings.length} ratings with an average of ${avgRating.toFixed(1)} stars`
      };

      // Save to database
      await prisma.sentimentSummary.upsert({
        where: { productId: parseInt(productId) },
        update: {
          reviewCount: actualReviewCount,
          ...basicAnalysis
        },
        create: {
          productId: parseInt(productId),
          reviewCount: actualReviewCount,
          ...basicAnalysis
        }
      });

      return NextResponse.json(basicAnalysis);
    }

    // Define the function that will be rate limited
    const performSentimentAnalysis = async () => {
      // Create prompt for Ollama
      const combinedReviews = comments.join("\n\n");
      const prompt = `
        Analyze these ${actualReviewCount} product reviews:
        
        ${combinedReviews}
        
        Provide a sentiment analysis with:
        1. Overall sentiment (positive, neutral, or negative)
        2. A sentiment score from -1 to 1
        3. Count of positive reviews
        4. Count of neutral reviews
        5. Count of negative reviews
        6. A brief 1-sentence summary of customer sentiment
        
        Important: There are exactly ${actualReviewCount} reviews total. The sum of positive, neutral, and negative counts MUST equal ${actualReviewCount}.
        
        Format your response STRICTLY as a JSON object with these keys:
        "overall_sentiment", "sentiment_score", "positive_count", "neutral_count", "negative_count", "summary"
      `;

      console.log(`Sentiment analysis: Processing ${comments.length} comments for product ${productId}`);

      try {
        // Call Ollama API
        const response = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.2:1b",
            prompt: prompt,
            stream: false
          })
        });

        if (!response.ok) {
          throw new Error(`Ollama API returned ${response.status}`);
        }

        const result = await response.json();
        const aiResponse = result.response || "";

        console.log("Ollama raw response:", aiResponse);

        // Parse the JSON from the response
        // Attempt to find a valid JSON substring if the model returns text around the JSON
        let parsed = null;
        try {
          // Try to extract a JSON object from the response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No JSON object found in response");
          }
        } catch (parseError) {
          console.error("Error parsing Ollama response:", parseError);
          // Fallback to rating-based sentiment if parsing fails
          parsed = {
            overall_sentiment: avgRating >= 4 ? "positive" : avgRating >= 3 ? "neutral" : "negative",
            sentiment_score: avgRating >= 4 ? 0.7 : avgRating >= 3 ? 0 : -0.7,
            positive_count: ratings.filter((r: number) => r >= 4).length,
            neutral_count: ratings.filter((r: number) => r === 3).length,
            negative_count: ratings.filter((r: number) => r <= 2).length,
            summary: `Product has ${ratings.length} ratings with an average of ${avgRating.toFixed(1)} stars`
          };
        }

        // Validate the counts
        if (parsed) {
          const totalSentimentCount = parsed.positive_count + parsed.neutral_count + parsed.negative_count;
          if (totalSentimentCount !== actualReviewCount) {
            console.log(`Fixing incorrect sentiment counts. LLM claimed ${totalSentimentCount}, actual: ${actualReviewCount}`);

            // Simple fix - classify by rating
            const posCount = ratings.filter((r: number) => r >= 4).length;
            const neutralCount = ratings.filter((r: number) => r === 3).length;
            const negCount = ratings.filter((r: number) => r <= 2).length;

            // Override the LLM's counts
            parsed.positive_count = posCount;
            parsed.neutral_count = neutralCount;
            parsed.negative_count = negCount;

            // Append a note to the summary if it's wrong
            if (!parsed.summary.includes("reviews")) {
              parsed.summary += ` (Based on ${actualReviewCount} reviews)`;
            }
          }

          try {
            // Store the result in the database
            await prisma.sentimentSummary.upsert({
              where: {
                productId: parseInt(productId)
              },
              update: {
                reviewCount: actualReviewCount,
                overall_sentiment: parsed.overall_sentiment,
                sentiment_score: parsed.sentiment_score,
                avg_rating: avgRating,
                positive_count: parsed.positive_count,
                neutral_count: parsed.neutral_count,
                negative_count: parsed.negative_count,
                summary: parsed.summary
              },
              create: {
                productId: parseInt(productId),
                reviewCount: actualReviewCount,
                overall_sentiment: parsed.overall_sentiment,
                sentiment_score: parsed.sentiment_score,
                avg_rating: avgRating,
                positive_count: parsed.positive_count,
                neutral_count: parsed.neutral_count,
                negative_count: parsed.negative_count,
                summary: parsed.summary
              }
            });
            console.log(`Sentiment analysis saved to database for product ${productId}`);
          } catch (dbError) {
            console.error("Error saving sentiment to database:", dbError);
          }
        }

        // Return the parsed sentiment analysis
        return {
          ...parsed,
          avg_rating: avgRating
        };
      } catch (error) {
        console.error("Error in Ollama request:", error);

        // Fallback to rating-based analysis
        const fallbackAnalysis = {
          overall_sentiment: avgRating >= 4 ? "positive" : avgRating >= 3 ? "neutral" : "negative",
          sentiment_score: avgRating >= 4 ? 0.7 : avgRating >= 3 ? 0 : -0.7,
          avg_rating: avgRating,
          positive_count: ratings.filter((r: number) => r >= 4).length,
          neutral_count: ratings.filter((r: number) => r === 3).length,
          negative_count: ratings.filter((r: number) => r <= 2).length,
          summary: `Based on ${ratings.length} ratings with an average of ${avgRating.toFixed(1)} stars`
        };

        // Still save the fallback to the database
        try {
          await prisma.sentimentSummary.upsert({
            where: { productId: parseInt(productId) },
            update: {
              reviewCount: actualReviewCount,
              ...fallbackAnalysis
            },
            create: {
              productId: parseInt(productId),
              reviewCount: actualReviewCount,
              ...fallbackAnalysis
            }
          });
        } catch (dbError) {
          console.error("Error saving fallback sentiment to database:", dbError);
        }

        return fallbackAnalysis;
      }
    };

    // Check if this is a background request
    if (isBackground) {
      console.log(`Processing background sentiment analysis for product ${productId}`);
      // Use rate limiter for background requests - directly schedule without imported module
      ollamaRateLimiter.schedule(performSentimentAnalysis)
        .then(() => console.log(`Background sentiment analysis completed for product ${productId}`))
        .catch(err => console.error(`Background sentiment analysis failed for product ${productId}:`, err));

      // Return immediately for background requests
      return NextResponse.json({ status: "processing" });
    } else {
      // For foreground requests, perform analysis and return result
      try {
        const analysis = await performSentimentAnalysis();
        return NextResponse.json(analysis);
      } catch (error) {
        console.error("Error in sentiment analysis:", error);
        // Fallback to rating-based sentiment
        const fallbackAnalysis = {
          overall_sentiment: avgRating >= 4 ? "positive" : avgRating >= 3 ? "neutral" : "negative",
          sentiment_score: avgRating >= 4 ? 0.7 : avgRating >= 3 ? 0 : -0.7,
          avg_rating: avgRating,
          positive_count: ratings.filter((r: number) => r >= 4).length,
          neutral_count: ratings.filter((r: number) => r === 3).length,
          negative_count: ratings.filter((r: number) => r <= 2).length,
          summary: `Product has ${ratings.length} ratings with an average of ${avgRating.toFixed(1)} stars`
        };
        return NextResponse.json(fallbackAnalysis);
      }
    }
  } catch (error) {
    console.error("Error in sentiment analysis API:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 }
    );
  }
}
// app/api/sentiment/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reviews = body.reviews || [];
    const productId = body.productId;
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
      return NextResponse.json({
        overall_sentiment: avgRating >= 4 ? "positive" : avgRating >= 3 ? "neutral" : "negative",
        sentiment_score: avgRating >= 4 ? 0.7 : avgRating >= 3 ? 0 : -0.7,
        avg_rating: avgRating,
        positive_count: ratings.filter((r: number) => r >= 4).length,
        neutral_count: ratings.filter((r: number) => r === 3).length,
        negative_count: ratings.filter((r: number) => r <= 2).length,
        summary: `Product has ${ratings.length} ratings with an average of ${avgRating.toFixed(1)} stars`
      });
    }

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
      throw new Error(`Failed to analyze sentiment with Ollama: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.response || "";

    console.log("Ollama raw response:", aiResponse);

    // Extract JSON from response
    try {
      const jsonStart = aiResponse.indexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}') + 1;

      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = aiResponse.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonStr);

        // Validate counts and fix if they don't match actual review count
        const totalSentimentCount =
          (parsed.positive_count || 0) +
          (parsed.neutral_count || 0) +
          (parsed.negative_count || 0);

        // If counts don't match, fix them
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
        console.log("Before saving to database");
        try {
          // Store the result in the database
          await prisma.sentimentSummary.upsert({
            where: {
              productId: parseInt(body.productId)
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
              productId: parseInt(body.productId),
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
          console.log("After saving to database");
        } catch (dbError) {
          console.error("Error saving sentiment to database:", dbError);
          // Continue - don't fail the request if DB save fails
        }

        return NextResponse.json({
          ...parsed,
          avg_rating: avgRating
        });
      }
    } catch (error) {
      console.error("Error parsing LLM response:", error);
    }

    // Fallback if JSON parsing fails - use simple rating-based analysis
    return NextResponse.json({
      overall_sentiment: avgRating >= 4 ? "positive" : avgRating >= 3 ? "neutral" : "negative",
      sentiment_score: avgRating >= 4 ? 0.7 : avgRating >= 3 ? 0 : -0.7,
      avg_rating: avgRating,
      positive_count: ratings.filter((r: number) => r >= 4).length,
      neutral_count: ratings.filter((r: number) => r === 3).length,
      negative_count: ratings.filter((r: number) => r <= 2).length,
      summary: `Product has an average rating of ${avgRating.toFixed(1)} stars from ${actualReviewCount} reviews.`
    });

  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 }
    );
  }
}
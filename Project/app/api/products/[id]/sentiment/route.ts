// app/api/products/[id]/sentiment/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";

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

    // If we have a cached sentiment and review count matches, return it
    if (cachedSentiment && cachedSentiment.reviewCount === reviewCount) {
      return NextResponse.json(cachedSentiment);
    }

    // Otherwise return null (client will need to generate a new one)
    return NextResponse.json(null);
  } catch (error) {
    console.error("Error fetching sentiment summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch sentiment summary" },
      { status: 500 }
    );
  }
}
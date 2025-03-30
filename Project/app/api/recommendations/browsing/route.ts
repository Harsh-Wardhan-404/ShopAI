import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRecommendationsFromBrowsingHistory, getPopularProducts } from "@/lib/recommendations";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Return browsing-based recommendations if logged in
    if (userId) {
      const products = await getRecommendationsFromBrowsingHistory(userId);
      return NextResponse.json({ products });
    }

    // Return popular products for anonymous users
    const products = await getPopularProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching browsing recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

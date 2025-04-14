import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRecommendations } from "@/lib/recommendations";

// Mark this route as dynamic to prevent static optimization issues
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get product ID from search params instead of route params
    const { searchParams } = new URL(request.url);
    const productIdParam = searchParams.get('id');

    if (!productIdParam) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const productId = parseInt(productIdParam, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 }
      );
    }

    // Check if product exists
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productExists) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get recommendations from Ollama based on product ID
    const products = await getRecommendations({ productId });

    // Always return a successful response, even if products array is empty
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching similar products:", error);
    // Return empty array instead of error
    return NextResponse.json({ products: [] });
  }
}
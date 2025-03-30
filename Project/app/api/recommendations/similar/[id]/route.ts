import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRecommendations } from "@/lib/recommendations";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id, 10);
    console.log("Processing similar products API for product:", productId);

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

    // Get recommendations or fallbacks
    try {
      const products = await getRecommendations({ productId });
      console.log(`Returning ${products?.length} recommendations for product ${productId}`);
      return NextResponse.json({ products });
    } catch (error) {
      console.error("Failed to get recommendations, falling back to popular products:", error);

      // Fallback to popular products
      const fallbackProducts = await prisma.product.findMany({
        where: { id: { not: productId } },
        orderBy: { orderItems: { _count: 'desc' } },
        take: 4,
        include: { categories: true }
      });

      return NextResponse.json({ products: fallbackProducts });
    }
  } catch (error) {
    console.error("Error in similar products API:", error);
    // Return empty array instead of error
    return NextResponse.json({ products: [] });
  }
}

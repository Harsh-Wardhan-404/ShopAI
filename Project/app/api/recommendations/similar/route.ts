import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRecommendations } from "@/lib/recommendations";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Use the ID directly from params
    const productId = parseInt(params.id, 10);

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
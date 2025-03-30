import { NextResponse } from "next/server";
import { getSimilarProducts } from "@/lib/recommendations";
import { prisma } from "@/lib/prisma";

// This is a server component, so we don't use any React context hooks here
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productIdStr = params.id;

    if (!productIdStr) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const productId = parseInt(productIdStr, 10);

    // Validate that the ID is a valid number
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 }
      );
    }
    // Check if product exists - avoiding any client hooks
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productExists) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Extract authentication token from headers if needed
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // Get similar products based on the product ID
    // Pass the token instead of relying on React context
    const products = await getSimilarProducts(productId, token);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return NextResponse.json(
      { error: "Failed to fetch similar products" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendations";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Processing recommendation request for order:", params.id);

    const orderId = parseInt(params.id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    // Check if order exists
    const orderExists = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!orderExists) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    try {
      // Get recommendations from Ollama based on order ID
      const products = await getRecommendations({ orderId });

      return NextResponse.json({ products });
    } catch (ollamaError) {
      console.error("Ollama recommendation error:", ollamaError);

      // Fallback to basic recommendations if Ollama fails
      const fallbackProducts = await prisma.product.findMany({
        take: 4,
        orderBy: {
          orderItems: {
            _count: 'desc'
          }
        },
        include: {
          Category: true
        }
      });

      return NextResponse.json({ products: fallbackProducts });
    }
  } catch (error) {
    console.error("Error in recommendation API:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations", details: String(error) },
      { status: 500 }
    );
  }
}
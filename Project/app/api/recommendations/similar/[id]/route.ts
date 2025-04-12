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

    // Check if product exists and get pre-computed recommendations if available
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        recommendedProductIds: true,
        recommendedProductsUpdatedAt: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if we have cached recommendations
    let products = [];
    const hasCachedRecommendations = !!product.recommendedProductIds;
    const needsRefresh = !product.recommendedProductsUpdatedAt ||
      new Date().getTime() - new Date(product.recommendedProductsUpdatedAt).getTime() > 86400000; // 24 hours

    // If we have cached recommendations, fetch those products
    if (hasCachedRecommendations) {
      const recommendedIds = product.recommendedProductIds.split(',').map(id => parseInt(id.trim(), 10));
      products = await prisma.product.findMany({
        where: {
          id: { in: recommendedIds }
        },
        include: { Category: true }
      });

      // Sort products to match the order in recommendedProductIds
      const idToOrderMap = new Map(recommendedIds.map((id, index) => [id, index]));
      products.sort((a, b) => (idToOrderMap.get(a.id) || 0) - (idToOrderMap.get(b.id) || 0));
    }

    // If we have cached recommendations, return them immediately
    if (products.length > 0) {
      console.log(`Returning ${products.length} cached recommendations for product ${productId}`);

      // Trigger a background update if needed
      if (needsRefresh) {
        console.log(`Triggering background refresh of recommendations for product ${productId}`);
        // Fetch fresh recommendations in the background
        updateRecommendationsInBackground(productId);
      }

      return NextResponse.json({
        products,
        cached: true,
        lastUpdated: product.recommendedProductsUpdatedAt,
        refreshing: needsRefresh
      });
    }

    // If no cached recommendations, get real-time recommendations
    console.log(`No cached recommendations found for product ${productId}, fetching in real-time`);
    try {
      const freshProducts = await getRecommendations({ productId });

      // Store these recommendations for future use
      if (freshProducts && freshProducts.length > 0) {
        const recommendedIds = freshProducts.map(p => p.id).join(',');
        await prisma.product.update({
          where: { id: productId },
          data: {
            recommendedProductIds: recommendedIds,
            recommendedProductsUpdatedAt: new Date()
          }
        });
      }

      console.log(`Returning ${freshProducts?.length} fresh recommendations for product ${productId}`);
      return NextResponse.json({ products: freshProducts, cached: false });
    } catch (error) {
      console.error("Failed to get recommendations, falling back to popular products:", error);

      // Fallback to popular products
      const fallbackProducts = await prisma.product.findMany({
        where: { id: { not: productId } },
        orderBy: { orderItems: { _count: 'desc' } },
        take: 4,
        include: { Category: true }
      });

      return NextResponse.json({ products: fallbackProducts, cached: false });
    }
  } catch (error) {
    console.error("Error in similar products API:", error);
    // Return empty array instead of error
    return NextResponse.json({ products: [] });
  }
}

// Function to update recommendations in the background
async function updateRecommendationsInBackground(productId: number) {
  try {
    // Use setTimeout with 0 to not block the response
    setTimeout(async () => {
      try {
        console.log(`Background update: Starting for product ${productId}`);
        const freshProducts = await getRecommendations({ productId });

        if (freshProducts && freshProducts.length > 0) {
          const recommendedIds = freshProducts.map(p => p.id).join(',');
          await prisma.product.update({
            where: { id: productId },
            data: {
              recommendedProductIds: recommendedIds,
              recommendedProductsUpdatedAt: new Date()
            }
          });
          console.log(`Background update: Successfully updated recommendations for product ${productId}`);
        } else {
          console.log(`Background update: No fresh recommendations found for product ${productId}`);
        }
      } catch (error) {
        console.error(`Background update: Failed for product ${productId}:`, error);
      }
    }, 0);
  } catch (error) {
    console.error(`Failed to queue background update for product ${productId}:`, error);
  }
}

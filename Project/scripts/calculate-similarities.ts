// scripts/calculate-similarities.ts
import { PrismaClient } from "@prisma/client";
import { getRecommendations } from "@/lib/recommendations";

async function main() {
  console.log("Starting product recommendations calculation...");

  const prisma = new PrismaClient();

  try {
    // Get all products
    const products = await prisma.product.findMany({
      select: { id: true }
    });

    console.log(`Found ${products.length} products to process`);

    // Recalculate recommendations for each product
    for (const product of products) {
      console.log(`Processing product ID: ${product.id}`);

      // Get recommendations for this product
      const recommendations = await getRecommendations({
        productId: product.id,
        limit: 5
      });

      if (recommendations && recommendations.length > 0) {
        // Save the recommendations
        const recommendedIds = recommendations.map(p => p?.id).join(',');
        await prisma.product.update({
          where: { id: product.id },
          data: {
            recommendedProductIds: recommendedIds,
            recommendedProductsUpdatedAt: new Date()
          }
        });
        console.log(`Saved ${recommendations.length} recommendations for product ${product.id}`);
      } else {
        console.log(`No recommendations found for product ${product.id}`);
      }
    }

    console.log("Product recommendations calculation completed successfully");
  } catch (error) {
    console.error("Error calculating product recommendations:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
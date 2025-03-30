// scripts/calculate-similarities.ts
import { PrismaClient } from "@prisma/client";
import { calculateProductSimilarities } from "@/lib/recommendations";

async function main() {
  console.log("Starting product similarity calculation...");
  
  try {
    await calculateProductSimilarities();
    console.log("Product similarity calculation completed successfully");
  } catch (error) {
    console.error("Error calculating product similarities:", error);
    process.exit(1);
  }
}

main();
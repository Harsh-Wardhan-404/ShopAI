-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "recommendedProductIds" TEXT,
ADD COLUMN     "recommendedProductsUpdatedAt" TIMESTAMP(3);

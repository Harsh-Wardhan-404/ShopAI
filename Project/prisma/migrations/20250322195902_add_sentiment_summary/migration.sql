-- CreateTable
CREATE TABLE "SentimentSummary" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "reviewCount" INTEGER NOT NULL,
    "overall_sentiment" TEXT NOT NULL,
    "sentiment_score" DOUBLE PRECISION NOT NULL,
    "avg_rating" DOUBLE PRECISION NOT NULL,
    "positive_count" INTEGER NOT NULL,
    "neutral_count" INTEGER NOT NULL,
    "negative_count" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SentimentSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SentimentSummary_productId_key" ON "SentimentSummary"("productId");

-- AddForeignKey
ALTER TABLE "SentimentSummary" ADD CONSTRAINT "SentimentSummary_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

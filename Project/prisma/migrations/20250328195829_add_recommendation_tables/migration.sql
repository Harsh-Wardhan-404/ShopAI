-- CreateTable
CREATE TABLE "ProductView" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSimilarity" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "similarId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductSimilarity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductView_userId_idx" ON "ProductView"("userId");

-- CreateIndex
CREATE INDEX "ProductView_productId_idx" ON "ProductView"("productId");

-- CreateIndex
CREATE INDEX "ProductSimilarity_productId_idx" ON "ProductSimilarity"("productId");

-- CreateIndex
CREATE INDEX "ProductSimilarity_similarId_idx" ON "ProductSimilarity"("similarId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSimilarity_productId_similarId_key" ON "ProductSimilarity"("productId", "similarId");

-- AddForeignKey
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSimilarity" ADD CONSTRAINT "ProductSimilarity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSimilarity" ADD CONSTRAINT "ProductSimilarity_similarId_fkey" FOREIGN KEY ("similarId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

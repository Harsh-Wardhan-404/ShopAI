import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewSection } from "@/components/products/ReviewSection"
import { StarIcon } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { ProductGrid } from "@/components/products/ProductGrid";




export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id)

  if (isNaN(productId)) {
    return notFound()
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: true }
  })

  if (!product) {
    return notFound()
  }

  const reviews = await prisma.review.findMany({
    where: { productId }
  });

  const reviewCount = reviews.length;
  const productRating = reviewCount > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  // Check if user has purchased the product
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  let canReview = false


  if (userId) {
    const hasOrderedProduct = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: { in: ["delivered", "completed"] }
        }
      }
    })

    canReview = !!hasOrderedProduct
  }

  const shortDescription = product.description
    ? product.description.substring(0, 150) + (product.description.length > 150 ? '...' : '')
    : 'No description available';
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left column - Product Image */}
        <div>
          <div className="rounded-lg overflow-hidden border bg-white">
            <Image
              src={product.imageUrl || "/placeholder.png"}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>

        {/* Right column - Product Info & Tabs */}
        <div className="flex flex-col">
          {/* Product info section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(productRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                      }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {reviewCount > 0
                  ? `${productRating.toFixed(1)} (${reviewCount} reviews)`
                  : "No reviews yet"}
              </span>
            </div>
            <p className="text-2xl font-bold mb-4">
              {formatCurrency(product.price)}
            </p>
            <div className="prose prose-sm mb-4 text-muted-foreground">
              <p>{shortDescription}</p>
            </div>

            {/* Add to cart section */}
            <div className="mt-6">
              <AddToCartButton product={product} />
            </div>
          </div>

          {/* Tabbed content for Description and Reviews */}
          <div className="mt-auto flex-1">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <div className="prose max-w-none">
                  <p>{product.description}</p>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <ReviewSection
                  productId={product.id}
                  canReview={canReview}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Related products section Uncomment later for product recommendation */}
      {/* <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You may also like</h2>
        <ProductGrid products={relatedProducts} />
      </div> */}
    </div>
  );
}
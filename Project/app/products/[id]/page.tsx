
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

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

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          <div className="mt-2 text-sm text-muted-foreground">
            Sold by {product.seller.name}
          </div>
          
          <div className="mt-4 text-2xl font-bold">
            {formatCurrency(product.price)}
          </div>
          
          {product.stock > 0 ? (
            <div className="mt-2 text-sm text-green-600">
              In stock ({product.stock} available)
            </div>
          ) : (
            <div className="mt-2 text-sm text-red-600">
              Out of stock
            </div>
          )}
          
          <div className="mt-6">
            <p className="text-base">{product.description}</p>
          </div>
          
          <div className="mt-8">
            <Button 
              size="lg" 
              className="w-full"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
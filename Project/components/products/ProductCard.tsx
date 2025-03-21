// components/products/ProductCard.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { toast } from "@/components/ui/use-toast"

interface ProductCardProps {
  product: {
    id: number
    name: string
    description?: string
    price: number
    imageUrl?: string
    category?: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    })
  }

  return (
    <div className="group relative rounded-lg border bg-card text-card-foreground shadow">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={product.imageUrl || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {product.category && (
            <span className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {product.category}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium">{product.name}</h3>
          <p className="mt-1 text-muted-foreground line-clamp-2 text-sm">
            {product.description}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-semibold">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full"
          variant="default"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
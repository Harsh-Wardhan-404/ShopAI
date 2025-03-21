"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/CartContext"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/?showAuth=login&redirect=/checkout')
      return
    }

    // Proceed to checkout
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <p className="mb-6">Your cart is empty.</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-lg border">
            <div className="p-4 border-b bg-muted/50">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Total</div>
              </div>
            </div>

            {items.map(item => (
              <div key={item.productId} className="p-4 border-b last:border-0">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 rounded overflow-hidden">
                        <Image
                          src={item.imageUrl || "/placeholder-product.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                          {item.name}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    {formatCurrency(item.price)}
                  </div>

                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-r-none"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        className="h-8 w-12 rounded-none text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="col-span-1 text-center">
                    {formatCurrency(item.price * item.quantity)}
                  </div>

                  <div className="col-span-1 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.productId)}
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>

            <Link href="/products">
              <Button variant="outline">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="border-t my-4 pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
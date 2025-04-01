"use client"

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Check, ArrowRight, ShoppingBag } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/contexts/CartContext"
import RecommendedProducts from "@/components/RecommendedProducts"

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)
  const [requestState, setRequestState] = useState({
    orderRequested: false,
    recommendationsRequested: false
  })
  const router = useRouter()
  const { toast } = useToast()
  const { clearCart } = useCart()

  useEffect(() => {
    // Clear cart when confirmation page loads
    clearCart()

    // Only run these API calls once
    if (!requestState.orderRequested) {
      const fetchOrder = async () => {
        try {
          // Set flag to prevent multiple requests
          setRequestState(prev => ({ ...prev, orderRequested: true }))

          const response = await fetch(`/api/orders/${params.id}`)

          if (!response.ok) {
            throw new Error("Failed to fetch order")
          }

          const data = await response.json()
          setOrder(data.order)
        } catch (error) {
          console.error("Error fetching order:", error)
          toast({
            title: "Error",
            description: "Could not load order details",
            variant: "destructive"
          })
        } finally {
          setLoading(false)
        }
      }

      fetchOrder()
    }

    // Only run recommendation API call once
    if (!requestState.recommendationsRequested) {
      const fetchRecommendations = async () => {
        try {
          // Set flag to prevent multiple requests
          setRequestState(prev => ({ ...prev, recommendationsRequested: true }))

          const response = await fetch(`/api/recommendations/order/${params.id}`)

          if (!response.ok) {
            throw new Error("Failed to fetch recommendations")
          }

          const data = await response.json()
          setRecommendations(data.products)
        } catch (error) {
          console.error("Error fetching recommendations:", error)
        } finally {
          setLoadingRecommendations(false)
        }
      }

      fetchRecommendations()
    }
  }, [params.id, toast, clearCart, requestState])

  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold mb-6">Order Confirmation</h1>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold mb-6">Order Not Found</h1>
        <p>We couldn't find the order you're looking for.</p>
        <Button asChild className="mt-4">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    )
  }

  // Format order date
  const orderDate = new Date(order.createdAt).toLocaleDateString()

  return (
    <div className="container py-12 px-4 sm:px-6 lg:px-8 bg-black text-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 rounded-full p-2 flex-shrink-0">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800">Thank you for your purchase!</h1>
              <p className="text-green-700 mt-1">Your order has been confirmed and is being processed.</p>
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-md overflow-hidden mb-8">
          <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Order Summary</h2>
          </div>
          
          {/* Order Details */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-100">
                  Order #{order.id}
                </span>
              </div>
              <p className="text-gray-300 font-medium">Placed on {orderDate}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-gray-700">
            <h3 className="font-semibold text-white mb-4">Items</h3>
            <div className="space-y-4 divide-y divide-gray-700">
              {order.orderItems?.map((item: any) => (
                <div key={item.id} className="flex justify-between pt-4 first:pt-0">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.product.name}</p>
                      <p className="text-sm text-gray-400 mt-1">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-400 mt-1">{formatCurrency(item.product.price)} each</p>
                    </div>
                  </div>
                  <p className="font-medium text-white">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="p-6 bg-gray-800">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-white">Total</p>
              <p className="text-lg font-bold text-green-400">{formatCurrency(
                order.totalAmount || 
                order.orderItems?.reduce((sum: number, item: any) =>
                  sum + (item.product.price * item.quantity), 0) || 0
              )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 h-12 rounded-lg">
            <Link href="/">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-gray-600 hover:bg-gray-800 text-gray-300 px-6 py-2 h-12 rounded-lg">
            <Link href="/account/orders">
              View All Orders
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="mt-16 max-w-6xl mx-auto">
        <div className="border-t border-gray-800 pt-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Recommended for You</h2>
          <RecommendedProducts
            products={recommendations}
            loading={loadingRecommendations}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  )
}
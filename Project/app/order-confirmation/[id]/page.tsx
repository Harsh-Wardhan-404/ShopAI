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
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Order Confirmed</h1>
              <p className="text-green-700">Thank you for your purchase!</p>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-medium mb-4">Order Summary</h2>
        <div className="bg-white border rounded-lg shadow-sm divide-y">
          <div className="p-4">
            <p className="text-sm text-gray-500">Order #{order.id}</p>
            <p className="text-sm text-gray-500">Placed on {orderDate}</p>
          </div>

          <div className="p-4">
            <h3 className="font-medium mb-3">Items</h3>
            <div className="space-y-4">
              {order.orderItems?.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p>{item.product.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p>{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 flex justify-between font-medium">
            <p>Total</p>
            <p>{formatCurrency(order.orderItems?.reduce((sum: number, item: any) =>
              sum + (item.product.price * item.quantity), 0) || 0)}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/orders">
              View All Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Ollama-powered recommendations */}
      <RecommendedProducts
        products={recommendations}
        loading={loadingRecommendations}
        title="Recommended for You"
        className="mt-12 max-w-6xl mx-auto"
      />
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Check, ArrowRight, ShoppingBag } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  
  useEffect(() => {
    async function fetchOrder() {
      try {
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
  }, [params.id, toast])
  
  if (loading) {
    return (
      <div className="container py-12 max-w-3xl mx-auto">
        <Skeleton className="h-12 w-2/3 mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }
  
  // If order not found and not loading
  if (!order && !loading) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Order Not Found</h1>
        <p className="mb-6">We couldn't find the order you're looking for.</p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    )
  }
  
  // If we have order data
  const shippingAddress = order.shippingAddress ? 
    (typeof order.shippingAddress === 'string' ? 
      JSON.parse(order.shippingAddress) : 
      order.shippingAddress) : 
    {};
  
  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 text-green-600 mb-4">
          <Check className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-2">
          Your order #{order.id} has been placed successfully
        </p>
      </div>
      
      <div className="border rounded-lg overflow-hidden mb-8">
        <div className="bg-muted p-4">
          <h2 className="font-semibold">Order Summary</h2>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="text-sm font-medium">Status: <span className="capitalize">{order.status}</span></p>
            <p className="text-sm font-medium">Payment Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Items</h3>
            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.product?.name || `Product #${item.productId}`} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Shipping Address</h3>
            <address className="not-italic text-sm">
              {shippingAddress.fullName}<br />
              {shippingAddress.address}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}<br />
              Phone: {shippingAddress.phone}
            </address>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button variant="outline" size="lg">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/account/orders">
          <Button size="lg">
            <ShoppingBag className="mr-2 h-4 w-4" /> View All Orders
          </Button>
        </Link>
      </div>
    </div>
  )
}
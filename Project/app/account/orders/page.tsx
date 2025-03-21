
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Eye, 
  Package, 
  ArrowRight,
  ShoppingBag
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    
    async function fetchOrders() {
      try {
        const response = await fetch("/api/orders")
        
        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }
        
        const data = await response.json()
        setOrders(data.orders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [isAuthenticated, router])
  
  // Handle loading state
  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }
  
  // If no orders
  if (orders.length === 0) {
    return (
      <div className="container py-12 text-center">
        <div className="mx-auto mb-6">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
        <p className="text-muted-foreground mb-6">
          You haven't placed any orders yet. Start shopping to place your first order!
        </p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    )
  }
  
  // Map status to badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success'
      case 'shipped':
        return 'info'
      case 'processing':
        return 'warning'
      case 'cancelled':
        return 'destructive'
      case 'pending':
      default:
        return 'secondary'
    }
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      
      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status) as any} className="capitalize">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>
                  <Link href={`/order-confirmation/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> Details
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
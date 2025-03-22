
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Package, ShoppingBag, Settings } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  const userId = session.user.id as string

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId }
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })
  ])

  if (!user) {
    redirect("/api/auth/signin")
  }

  // Get order status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'delivered': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <Tabs defaultValue="profile" className="w-full ">
        <TabsList className="w-auto mx-auto mb-8 items-center justify-center">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center mb-4">
                    <div className="relative w-20 h-20 mr-4 rounded-full overflow-hidden">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl font-bold">
                          {user.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{user.name}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <p className="text-sm mt-1">Member since {formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Card className="bg-primary/5">
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-2">Account Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Orders</p>
                          <p className="font-medium text-lg">{orders.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Role</p>
                          <p className="font-medium text-lg capitalize">{user.role?.toLowerCase() || "User"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                  <p className="mt-1 text-muted-foreground">When you place orders, they will appear here.</p>
                  <Button className="mt-4" asChild>
                    <Link href="/products">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center">
                            <div className="relative w-12 h-12 rounded overflow-hidden mr-3">
                              {item.product.imageUrl ? (
                                <Image
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Link
                                href={`/products/${item.productId}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {item.product.name}
                              </Link>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(item.price)} × {item.quantity}
                                </p>
                                <p className="font-medium">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/order-confirmation/${order.id}`}>
                            View Order Details
                          </Link>
                        </Button>

                        {/* Only show this button if we want to implement order tracking */}
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <Button size="sm" variant="ghost">
                            Track Order
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Account settings will be implemented in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
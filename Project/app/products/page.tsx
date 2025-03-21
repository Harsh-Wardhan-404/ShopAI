
import { ProductCard } from "@/components/products/ProductCard"
import { prisma } from "@/lib/prisma"

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {products.map((product) => (
          //@ts-ignore
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
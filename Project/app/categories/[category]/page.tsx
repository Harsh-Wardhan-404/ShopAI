import { ProductCard } from "@/components/products/ProductCard"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = params.category

  if (!category) return notFound()

  // Get products for this category
  const products = await prisma.product.findMany({
    where: {
      category: decodeURIComponent(category)
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (products.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{decodeURIComponent(category)}</h1>
        <p>No products found in this category.</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{decodeURIComponent(category)}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

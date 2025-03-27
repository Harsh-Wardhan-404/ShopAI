import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function CategoriesPage() {
  // Get unique categories with product counts
  const categoryData = await prisma.product.groupBy({
    by: ['category'],
    _count: {
      id: true
    },
    where: {
      category: {
        not: null
      }
    }
  })

  // Sort categories by product count (descending)
  const sortedCategories = categoryData.sort((a, b) =>
    (b._count?.id || 0) - (a._count?.id || 0)
  )

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Shop by Category</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedCategories.map((category) => (
          <Link
            href={`/categories/${encodeURIComponent(category.category || '')}`}
            key={category.category}
            className="group"
          >
            <div className="border rounded-lg p-6 transition-all duration-200 shadow hover:shadow-md group-hover:-translate-y-1">
              <h2 className="text-xl font-semibold">{category.category}</h2>
              <p className="text-sm text-gray-500 mt-1">{category._count?.id || 0} products</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

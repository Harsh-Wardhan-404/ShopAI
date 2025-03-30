import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type ProductType = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  categories?: { id: number; name: string }[];
};

interface RecommendedProductsProps {
  products: ProductType[];
  loading?: boolean;
  title?: string;
  className?: string;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ 
  products, 
  loading = false, 
  title = "You might also like",
  className = "" 
}) => {
  if (loading) {
    return (
      <div className={`mt-8 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't show anything if no products
  }

  return (
    <div className={`mt-8 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/products/${product.id}`} 
            className="group"
          >
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.imageUrl || "/images/placeholder.png"}
                alt={product.name}
                width={300}
                height={300}
                className="h-full w-full object-cover object-center group-hover:opacity-75"
              />
            </div>
            <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
            <p className="mt-1 text-lg font-medium text-gray-900">
              {formatCurrency(product.price)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
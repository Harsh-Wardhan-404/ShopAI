import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

type ProductType = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  categories?: { id: number; name: string }[];
};

interface RecommendedProductsProps {
  products: ProductType[];
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ products }) => {
  return (
    <>
      {products.map((product) => (
        <Link href={`/products/${product.id}`} key={product.id} className="group">
          <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100">
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                className="h-full w-full object-cover object-center group-hover:opacity-75"
              />
            )}
          </div>
          <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
          <p className="mt-1 text-lg font-medium text-gray-900">
            {formatCurrency(product.price)}
          </p>
        </Link>
      ))}
    </>
  );
};

export default RecommendedProducts;

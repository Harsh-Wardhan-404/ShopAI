"use client";

import { useEffect, useState } from 'react';
import { Product } from '@prisma/client';
import { ProductCard } from '@/components/products/ProductCard';

interface ProductWithCategories extends Product {
  categories: { id: number; name: string }[];
}

// Interface matching what ProductCard expects
interface ProductCardType {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

export default function ProductRecommendations({ productId }: { productId: number }) {
  const [recommendations, setRecommendations] = useState<ProductWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`Fetching recommendations for product: ${productId}`);
        const response = await fetch(`/api/recommendations/similar/${productId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received recommendations:", data);

        if (data.products && data.products.length > 0) {
          setRecommendations(data.products);
        } else {
          // If no recommendations are returned, fetch popular products instead
          console.log("No recommendations returned, fetching popular products");
          const popularResponse = await fetch('/api/products/popular?limit=4');
          if (popularResponse.ok) {
            const popularData = await popularResponse.json();
            setRecommendations(popularData.products || []);
          }
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Failed to fetch recommendations');

        // Try to get popular products as a backup
        try {
          const popularResponse = await fetch('/api/products/popular?limit=4');
          if (popularResponse.ok) {
            const popularData = await popularResponse.json();
            setRecommendations(popularData.products || []);
          }
        } catch (fallbackError) {
          console.error('Failed to fetch fallback products:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRecommendations();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">You might also like</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    // Instead of showing error, just show an empty state
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">You might also like</h2>
        <p className="text-gray-500">No recommendations available at the moment.</p>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">You might also like</h2>
        <p className="text-gray-500">No recommendations available at the moment.</p>
      </div>
    );
  }

  // Map Prisma products to ProductCard format
  const mappedProducts: ProductCardType[] = recommendations.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description || undefined,
    price: product.price,
    imageUrl: product.imageUrl || undefined,
    category: product.categories?.length > 0 ? product.categories[0].name : undefined
  }));

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">You might also like</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {mappedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
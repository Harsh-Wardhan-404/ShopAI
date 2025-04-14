"use client";

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/products/ProductCard';

// Define the Product interface instead of importing it
interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Add any other fields your product has
}

interface ProductWithCategories extends Product {
  Category: { id: number; name: string }[];
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pollingTimeout, setPollingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching recommendations for product: ${productId}`);

        const response = await fetch(`/api/recommendations/similar?id=${productId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received recommendations:", data);

        // Always show whatever products we get (either cached or popular products)
        if (data.products && data.products.length > 0) {
          setRecommendations(data.products);

          // Set refreshing state based on API response
          setIsRefreshing(data.refreshing || false);

          // If recommendations are being refreshed in the background, start polling for updates
          if (data.refreshing) {
            const timeout = setTimeout(() => pollForUpdatedRecommendations(productId), 3000);
            setPollingTimeout(timeout);
          }
        } else {
          // Fallback if no products at all were returned (shouldn't happen with our updated API)
          await fetchPopularProducts();
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Failed to fetch recommendations');
        await fetchPopularProducts();
      } finally {
        setLoading(false);
      }
    };

    const fetchPopularProducts = async () => {
      try {
        console.log("Fetching popular products as fallback");
        const popularResponse = await fetch('/api/products/popular?limit=4');
        if (popularResponse.ok) {
          const popularData = await popularResponse.json();
          setRecommendations(popularData.products || []);
        }
      } catch (fallbackError) {
        console.error('Failed to fetch fallback products:', fallbackError);
      }
    };

    fetchRecommendations();

    // Cleanup polling on unmount
    return () => {
      if (pollingTimeout) {
        clearTimeout(pollingTimeout);
      }
    };
  }, [productId]);

  const pollForUpdatedRecommendations = async (productId: number) => {
    try {
      console.log('Polling for updated recommendations');
      const response = await fetch(`/api/recommendations/similar?id=${productId}`);

      if (!response.ok) {
        console.error('Failed to poll for updated recommendations');
        setIsRefreshing(false);
        return;
      }

      const data = await response.json();

      // Only update if we have new recommendations and they're different
      if (data.products && data.products.length > 0) {
        const currentIds = recommendations.map(p => p.id).join(',');
        const newIds = data.products.map((p: any) => p.id).join(',');

        if (currentIds !== newIds) {
          console.log('Found updated recommendations, refreshing UI');
          setRecommendations(data.products);
        }

        // If still refreshing, continue polling, otherwise stop
        setIsRefreshing(data.refreshing || false);

        if (data.refreshing) {
          const timeout = setTimeout(() => pollForUpdatedRecommendations(productId), 3000);
          setPollingTimeout(timeout);
        }
      } else {
        // Stop polling if we no longer get recommendations
        setIsRefreshing(false);
      }
    } catch (error) {
      console.error('Error polling for updated recommendations:', error);
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">You might also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="bg-gray-200 rounded-md h-40 w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !recommendations.length) {
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
    category: product.Category?.length > 0 ? product.Category[0].name : undefined
  }));

  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-bold">You might also like</h2>
        {isRefreshing && (
          <div className="ml-2 text-xs flex items-center text-gray-500">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Optimizing recommendations...</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mappedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
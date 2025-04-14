"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This component prefetches commonly accessed routes to improve navigation performance
 * It also keeps track of which pages have been visited to avoid redundant prefetching
 */
export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    // Set of visited paths to avoid redundant prefetching
    const visitedPaths = new Set();

    // Common paths that should be prefetched
    const commonPaths = [
      '/cart',
      '/checkout',
      '/products',
      '/profile',
      '/about-us'
    ];

    // Routes prefetched during user idle time
    const prefetchRoutes = () => {
      if ('requestIdleCallback' in window) {
        // Use requestIdleCallback for browsers that support it
        window.requestIdleCallback(() => {
          commonPaths.forEach(path => {
            if (!visitedPaths.has(path)) {
              router.prefetch(path);
              visitedPaths.add(path);
            }
          });
        });
      } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(() => {
          commonPaths.forEach(path => {
            if (!visitedPaths.has(path)) {
              router.prefetch(path);
              visitedPaths.add(path);
            }
          });
        }, 1000);
      }
    };

    // Prefetch common routes after initial load
    prefetchRoutes();

    // Prefetch featured product pages
    const prefetchPopularProducts = async () => {
      try {
        // Get popular product IDs
        const response = await fetch('/api/products/popular?limit=5');
        if (response.ok) {
          const data = await response.json();
          if (data.products) {
            data.products.forEach((product: any) => {
              const productPath = `/products/${product.id}`;
              if (!visitedPaths.has(productPath)) {
                router.prefetch(productPath);
                visitedPaths.add(productPath);
              }
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch popular products for prefetching:', error);
      }
    };

    // Delay popular product prefetching to prioritize main navigation routes
    setTimeout(prefetchPopularProducts, 2000);

    // API warm-up (separate from Ollama warm-up)
    const warmUpEndpoints = async () => {
      try {
        // Warm up API endpoints that might be used
        const warmupEndpoints = [
          '/api/products?limit=1',
          '/api/products/popular?limit=1'
        ];

        await Promise.allSettled(
          warmupEndpoints.map(endpoint =>
            fetch(endpoint, {
              method: 'GET',
              // Use only-if-cached to avoid unnecessary network requests
              cache: 'only-if-cached',
              // @ts-ignore - 'priority' exists in newer fetch specs but not in TypeScript's types
              priority: 'low'
            }).catch(() => { })
          )
        );
      } catch (error) {
        // Silent error handling - this is just optimization
      }
    };

    // Delay API warmup
    setTimeout(warmUpEndpoints, 3000);

    // Explicitly warm up Ollama if it's available (handled by middleware)
    const warmupOllama = async () => {
      try {
        await fetch('/api/init/route', {
          method: 'GET',
          // @ts-ignore - 'priority' exists in newer fetch specs but not in TypeScript's types
          priority: 'low'
        });
      } catch (error) {
        // Silent error handling - this is just optimization
      }
    };

    // Last priority - warm up Ollama
    setTimeout(warmupOllama, 5000);

  }, [router]);

  // This component doesn't render anything
  return null;
}
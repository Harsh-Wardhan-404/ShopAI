"use client";

import { useEffect, useState } from "react";
import RecommendedProducts from "@/components/RecommendedProducts";

interface ProductRecommendationsProps {
  productId: number;
}

export default function ProductRecommendations({ productId }: ProductRecommendationsProps) {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  useEffect(() => {
    async function fetchSimilarProducts() {
      try {
        const response = await fetch(`/api/recommendations/similar/${productId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch similar products");
        }
        
        const data = await response.json();
        setSimilarProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setLoadingSimilar(false);
      }
    }
    
    fetchSimilarProducts();
  }, [productId]);

  return (
    <RecommendedProducts 
      products={similarProducts}
      loading={loadingSimilar}
      title="You might also like"
    />
  );
}
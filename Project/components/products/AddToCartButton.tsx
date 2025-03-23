// components/products/AddToCartButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface AddToCartButtonProps {
  product: any;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Add item to cart
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      
    });
    
    // Show toast notification
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
    
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <Button 
      onClick={handleAddToCart}
      className="w-full"
      disabled={isAdding}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
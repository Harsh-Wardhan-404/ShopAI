// components/products/ProductGrid.tsx
import { ProductCard } from "./ProductCard";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Define the Product interface directly instead of importing it
interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  // Add other fields as needed
}

interface ProductGridProps {
  products: any[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <Card className="h-full overflow-hidden transition-all hover:shadow-md">
            <div className="aspect-square overflow-hidden relative">
              <Image
                src={product.imageUrl || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium line-clamp-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {product.description?.substring(0, 60)}...
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <p className="font-bold">{formatCurrency(product.price)}</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
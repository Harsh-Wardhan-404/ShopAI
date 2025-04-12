"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProductDetailSkeleton() {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left column - Product Image Skeleton */}
        <div>
          <div className="rounded-lg overflow-hidden border bg-white">
            <Skeleton className="w-full h-[400px] md:h-[600px]" />
          </div>
        </div>

        {/* Right column - Product Info & Tabs Skeleton */}
        <div className="flex flex-col">
          {/* Product info section skeleton */}
          <div className="mb-6">
            <Skeleton className="h-10 w-3/4 mb-4" />

            <div className="flex items-center mb-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Skeleton key={star} className="w-5 h-5" />
                ))}
              </div>
              <Skeleton className="h-4 w-32 ml-2" />
            </div>

            <Skeleton className="h-8 w-32 mb-4" />

            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>

            {/* Add to cart button skeleton */}
            <div className="mt-6">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Tabbed content skeleton */}
          <div className="mt-auto flex-1">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <div className="space-y-4">
                  {[1, 2].map((review) => (
                    <div key={review} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Skeleton className="h-5 w-40 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Skeleton key={star} className="w-4 h-4 mr-1" />
                          ))}
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mt-2" />
                      <Skeleton className="h-4 w-4/5 mt-1" />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Recommendations section skeleton */}
      <div className="mt-16">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
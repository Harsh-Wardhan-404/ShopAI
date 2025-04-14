import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Sparkles, Battery, ShoppingBag } from "lucide-react"
import { SpotlightPreview } from "@/components/Hero"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductCarousel } from "@/components/products/ProductCarousel"
import { prisma } from "@/lib/prisma"
import { dynamic } from './config';

export default async function Home() {
  // Fetch featured products from the database
  const featuredProducts = await prisma.product.findMany({
    take: 8, // Limit to 8 products
    orderBy: {
      createdAt: 'desc' // Get the newest products
    }
  });

  return (
    <>
      {/* <SpotlightPreview /> */}
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-b from-primary/20 to-background">
          <div className="container mx-auto text-center relative z-10">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80')] opacity-5 bg-cover bg-center pointer-events-none" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 relative">
              Sustainable Shopping,{" "}
              <span className="text-primary">AI-Powered</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover eco-friendly products with personalized recommendations powered by artificial intelligence.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/products" className="inline-block">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Shop Now
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">Learn More</Button>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose shop.ai?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 mb-4">
                    <Leaf className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
                  <p className="text-muted-foreground">
                    All products are vetted for their environmental impact
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
                  <p className="text-muted-foreground">
                    Smart recommendations based on your preferences
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 mb-4">
                    <Battery className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Energy Efficient</h3>
                  <p className="text-muted-foreground">
                    Our platform is optimized for minimal energy consumption
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary/10 p-3 w-12 h-12 mb-4">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
                  <p className="text-muted-foreground">
                    Carefully curated selection of sustainable items
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 px-4 bg-primary/5">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link href="/products">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  View All
                </Button>
              </Link>
            </div>

            {/* Product Carousel */}
            <ProductCarousel products={featuredProducts} />
          </div>
        </section>
      </div>
    </>
  )
}
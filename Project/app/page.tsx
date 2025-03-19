import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Sparkles, Battery, ShoppingBag } from "lucide-react"
import { SpotlightPreview } from "@/components/Hero"

export default function Home() {
  return (
    <>
      {/* <SpotlightPreview /> */}
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-b from-primary/20 to-background">
          <div className="container mx-auto text-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80')] opacity-5 bg-cover bg-center" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 relative">
              Sustainable Shopping,{" "}
              <span className="text-primary">AI-Powered</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover eco-friendly products with personalized recommendations powered by artificial intelligence.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">Shop Now</Button>
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
            <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  image: "https://images.unsplash.com/photo-1602532305019-3f0a7e04997c?auto=format&fit=crop&w=800&q=80",
                  title: "Bamboo Essentials Set",
                  description: "Sustainable bathroom accessories"
                },
                {
                  image: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
                  title: "Eco Water Bottle",
                  description: "Reusable stainless steel"
                },
                {
                  image: "https://images.unsplash.com/photo-1564424224827-cd24b8915874?auto=format&fit=crop&w=800&q=80",
                  title: "Organic Cotton Tote",
                  description: "Plastic-free shopping companion"
                }
              ].map((product, i) => (
                <Card key={i} className="overflow-hidden border-primary/20">
                  <div className="aspect-square relative">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{product.title}</h3>
                    <p className="text-muted-foreground mb-4">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">$29.99</span>
                      <Button className="bg-primary hover:bg-primary/90">Add to Cart</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>

  )
}
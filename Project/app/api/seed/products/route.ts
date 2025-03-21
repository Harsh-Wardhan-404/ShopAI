
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Only enable in development
const isDevelopment = process.env.NODE_ENV === 'development';

export async function POST(request: Request) {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate data
    if (!Array.isArray(body.products) || body.products.length === 0) {
      return NextResponse.json(
        { error: "Expected an array of products" },
        { status: 400 }
      );
    }
    
    // Get or create a test user if not provided
    let sellerId = body.sellerId;
    
    if (!sellerId) {
      const testUser = await prisma.user.findFirst({
        where: { email: "test@example.com" }
      });
      
      if (testUser) {
        sellerId = testUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            email: "test@example.com",
            name: "Test User",
            role: "SELLER"
          }
        });
        sellerId = newUser.id;
      }
    }
    
    // Create products
    const products = await Promise.all(
      body.products.map(async (product: any) => {
        return prisma.product.create({
          data: {
            name: product.name,
            description: product.description || "",
            price: parseFloat(product.price),
            stock: product.stock ? parseInt(product.stock) : 10,
            imageUrl: product.imageUrl || null,
            category: product.category || null,
            sellerId: sellerId,
          }
        });
      })
    );
    
    return NextResponse.json({ 
      message: `Successfully created ${products.length} products`, 
      products 
    }, { status: 201 });
  } catch (error) {
    console.error("Error seeding products:", error);
    return NextResponse.json(
      { error: "Failed to seed products" },
      { status: 500 }
    );
  }
}
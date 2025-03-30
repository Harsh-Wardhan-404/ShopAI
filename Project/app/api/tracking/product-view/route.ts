// app/api/tracking/product-view/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Don't track if not logged in
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not logged in" });
    }
    
    const body = await request.json();
    const { productId } = body;
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Record the product view
    await prisma.productView.create({
      data: {
        userId,
        productId: parseInt(productId),
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking product view:", error);
    return NextResponse.json(
      { error: "Failed to track product view" },
      { status: 500 }
    );
  }
}
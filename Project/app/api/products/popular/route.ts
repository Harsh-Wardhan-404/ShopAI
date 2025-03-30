import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 4;

    const products = await prisma.product.findMany({
      orderBy: {
        orderItems: {
          _count: 'desc'
        }
      },
      take: limit,
      include: {
        categories: true
      }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching popular products:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular products" },
      { status: 500 }
    );
  }
}

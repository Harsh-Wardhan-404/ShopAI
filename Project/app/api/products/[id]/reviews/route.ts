// app/api/products/[id]/reviews/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

// GET all reviews for a product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST a new review
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to post a review" },
        { status: 401 }
      );
    }

    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate rating
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user has purchased the product
    const hasOrderedProduct = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: { in: ["delivered", "completed"] } // Only count completed orders
        }
      }
    });

    if (!hasOrderedProduct) {
      return NextResponse.json(
        { error: "You can only review products you've purchased" },
        { status: 403 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: {
          id: existingReview.id,
        },
        data: {
          rating: body.rating,
          comment: body.comment || "",
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Review updated successfully",
        review: updatedReview,
      });
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        rating: body.rating,
        comment: body.comment || "",
        userId: session.user.id,
        productId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Review added successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { error: "Failed to add review" },
      { status: 500 }
    );
  }
}
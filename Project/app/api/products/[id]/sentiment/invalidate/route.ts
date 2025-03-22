
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const productId = parseInt(params.id);

    // Delete the cached sentiment
    await prisma.sentimentSummary.delete({
      where: { productId }
    }).catch(() => {
      // Ignore if no record exists
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error invalidating sentiment cache:", error);
    return NextResponse.json(
      { error: "Failed to invalidate sentiment cache" },
      { status: 500 }
    );
  }
}
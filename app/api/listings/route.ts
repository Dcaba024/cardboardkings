import { NextResponse } from "next/server";
import { getPrisma } from "../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const prisma = getPrisma();
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(listings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, priceCents, imageUrl, status } = body ?? {};

    const numericPrice = Number(priceCents);
    if (!title || !description || !imageUrl || Number.isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        priceCents: numericPrice,
        imageUrl,
        status: status ?? "ACTIVE",
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create listing." },
      { status: 500 }
    );
  }
}

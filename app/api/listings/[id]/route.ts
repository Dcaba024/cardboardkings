import { NextResponse } from "next/server";
import { getPrisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = getPrisma();
  const listing = await prisma.listing.findUnique({ where: { id } });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json(listing);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, title, description, priceCents, imageUrl } = body ?? {};

  const prisma = getPrisma();
  const listing = await prisma.listing.update({
    where: { id },
    data: {
      status,
      title,
      description,
      priceCents: priceCents !== undefined ? Number(priceCents) : undefined,
      imageUrl,
    },
  });

  return NextResponse.json(listing);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = getPrisma();
  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

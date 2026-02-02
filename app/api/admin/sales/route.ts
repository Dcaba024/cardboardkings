import { NextResponse } from "next/server";
import { getIsAdmin } from "../../../lib/auth";
import { getPrisma } from "../../../lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();
  const min = searchParams.get("min")?.trim();
  const max = searchParams.get("max")?.trim();

  const createdAt: Prisma.DateTimeFilter = {};
  if (from) {
    const parsed = new Date(from);
    if (!Number.isNaN(parsed.getTime())) {
      createdAt.gte = parsed;
    }
  }
  if (to) {
    const parsed = new Date(to);
    if (!Number.isNaN(parsed.getTime())) {
      createdAt.lte = parsed;
    }
  }

  const amountTotalCents: Prisma.IntFilter = {};
  if (min) {
    const parsed = Number(min);
    if (Number.isFinite(parsed)) {
      amountTotalCents.gte = Math.round(parsed * 100);
    }
  }
  if (max) {
    const parsed = Number(max);
    if (Number.isFinite(parsed)) {
      amountTotalCents.lte = Math.round(parsed * 100);
    }
  }

  const where: Prisma.SaleWhereInput = {};
  if (Object.keys(createdAt).length > 0) {
    where.createdAt = createdAt;
  }
  if (Object.keys(amountTotalCents).length > 0) {
    where.amountTotalCents = amountTotalCents;
  }
  if (query) {
    where.OR = [
      { buyerEmail: { contains: query, mode: "insensitive" } },
      { buyerName: { contains: query, mode: "insensitive" } },
      { stripeSessionId: { contains: query, mode: "insensitive" } },
      { stripePaymentIntentId: { contains: query, mode: "insensitive" } },
    ];
  }

  const prisma = getPrisma();
  const sales = await prisma.sale.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const listingIds = Array.from(
    new Set(sales.flatMap((sale) => sale.listingIds ?? []))
  );
  const listings = listingIds.length
    ? await prisma.listing.findMany({
        where: { id: { in: listingIds } },
        select: { id: true, title: true, priceCents: true, imageUrl: true },
      })
    : [];
  const listingMap = new Map(listings.map((listing) => [listing.id, listing]));

  const payload = sales.map((sale) => ({
    ...sale,
    listingTitles: (sale.listingIds ?? [])
      .map((id) => listingMap.get(id))
      .filter(Boolean)
      .map((listing) => listing!.title),
    listingImages: (sale.listingIds ?? [])
      .map((id) => listingMap.get(id))
      .filter(Boolean)
      .map((listing) => listing!.imageUrl),
  }));

  return NextResponse.json({ sales: payload });
}

import { NextResponse } from "next/server";
import { getPrisma } from "../../lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids : [];
  const normalizedIds = ids.filter((id: unknown) => typeof id === "string" && id.trim() !== "");

  if (normalizedIds.length === 0) {
    return NextResponse.json({ error: "No items provided." }, { status: 400 });
  }

  const prisma = getPrisma();
  const result = await prisma.listing.updateMany({
    where: {
      id: { in: normalizedIds },
      status: "ACTIVE",
    },
    data: { status: "SOLD" },
  });

  return NextResponse.json({ updated: result.count });
}

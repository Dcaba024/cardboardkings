import { NextRequest, NextResponse } from "next/server";
import { getIsAdmin } from "../../../../lib/auth";
import { getPrisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

type UpdatePayload = {
  shippingLine1?: string;
  shippingLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostal?: string;
  shippingCountry?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as UpdatePayload | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const prisma = getPrisma();
  const sale = await prisma.sale.update({
    where: { id },
    data: {
      shippingLine1: body.shippingLine1?.trim() || null,
      shippingLine2: body.shippingLine2?.trim() || null,
      shippingCity: body.shippingCity?.trim() || null,
      shippingState: body.shippingState?.trim() || null,
      shippingPostal: body.shippingPostal?.trim() || null,
      shippingCountry: body.shippingCountry?.trim() || null,
      buyerName: body.buyerName?.trim() || null,
      buyerEmail: body.buyerEmail?.trim() || null,
      buyerPhone: body.buyerPhone?.trim() || null,
    },
  });

  return NextResponse.json({ sale });
}

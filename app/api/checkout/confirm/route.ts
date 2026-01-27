import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPrisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20",
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed." },
        { status: 400 }
      );
    }

    const listingIds = session.metadata?.listingIds;
    if (!listingIds) {
      return NextResponse.json({ ok: true, updated: 0 });
    }

    const ids = JSON.parse(listingIds) as string[];
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ ok: true, updated: 0 });
    }

    const prisma = getPrisma();
    const result = await prisma.listing.updateMany({
      where: { id: { in: ids }, status: "ACTIVE" },
      data: { status: "SOLD" },
    });

    return NextResponse.json({ ok: true, updated: result.count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

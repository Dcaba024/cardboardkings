import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPrisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secret || !secretKey) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20",
  });

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const listingIds = session.metadata?.listingIds;
    if (listingIds) {
      const ids = JSON.parse(listingIds) as string[];
      if (Array.isArray(ids) && ids.length > 0) {
        const prisma = getPrisma();
        await prisma.listing.updateMany({
          where: { id: { in: ids }, status: "ACTIVE" },
          data: { status: "SOLD" },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}

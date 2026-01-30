import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPrisma } from "../../../lib/prisma";
import { isEmailConfigured, sendEmail } from "../../../lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secret || !secretKey) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia",
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
      let ids: string[] = [];
      try {
        ids = JSON.parse(listingIds) as string[];
      } catch (error) {
        console.error("Invalid listingIds metadata:", error);
      }
      if (Array.isArray(ids) && ids.length > 0) {
        const prisma = getPrisma();
        await prisma.listing.updateMany({
          where: { id: { in: ids }, status: "ACTIVE" },
          data: { status: "SOLD" },
        });

        if (isEmailConfigured()) {
          const listings = await prisma.listing.findMany({
            where: { id: { in: ids } },
            orderBy: { createdAt: "desc" },
          });

          const buyerEmail =
            session.customer_details?.email ?? session.customer_email ?? "";
          const adminEmail = process.env.EMAIL_TO ?? "";

          const shipping = session.shipping_details;
          const address = shipping?.address;
          const addressLines = [
            shipping?.name,
            address?.line1,
            address?.line2,
            [
              address?.city,
              address?.state,
              address?.postal_code,
              address?.country,
            ]
              .filter(Boolean)
              .join(", "),
          ]
            .filter(Boolean)
            .join("\n");

          const itemsText = listings
            .map(
              (listing) =>
                `• ${listing.title} — $${(listing.priceCents / 100).toFixed(0)}`
            )
            .join("\n");

          const messageText = [
            "Purchase completed.",
            "",
            "Items:",
            itemsText || "No items found.",
            "",
            "Shipping:",
            addressLines || "No shipping details provided.",
          ].join("\n");

          const subject = "New card purchase";

          try {
            if (buyerEmail) {
              await sendEmail({
                to: buyerEmail,
                subject: "Your Cardboard Kings order",
                text: messageText,
              });
            }
            if (adminEmail) {
              await sendEmail({
                to: adminEmail,
                subject,
                text: messageText,
              });
            }
          } catch (error) {
            console.error("Email send failed:", error);
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

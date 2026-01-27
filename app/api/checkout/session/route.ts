import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.items) ? (body.items as CheckoutItem[]) : [];
  const filtered = items.filter(
    (item) =>
      item &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.price === "number" &&
      typeof item.quantity === "number"
  );

  if (filtered.length === 0) {
    return NextResponse.json({ error: "No items provided." }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20",
  });

  const headerOrigin = request.headers.get("origin");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host");
  const fallbackOrigin =
    host ? `${forwardedProto}://${host}` : process.env.NEXT_PUBLIC_APP_URL;
  const origin = headerOrigin ?? fallbackOrigin ?? "";

  if (!origin) {
    return NextResponse.json(
      { error: "Missing request origin for Stripe redirect URLs." },
      { status: 500 }
    );
  }

  const successUrl = new URL(
    "/success?session_id={CHECKOUT_SESSION_ID}",
    origin
  ).toString();
  const cancelUrl = new URL("/cancel", origin).toString();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: filtered.map((item) => {
        const resolvedImageUrl = item.image
          ? new URL(item.image, origin).toString()
          : undefined;
        const imageUrl =
          resolvedImageUrl && resolvedImageUrl.length <= 2048
            ? resolvedImageUrl
            : undefined;

        return {
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(item.price * 100),
            product_data: {
              name: item.name,
              images: imageUrl ? [imageUrl] : [],
            },
          },
        };
      }),
      metadata: {
        listingIds: JSON.stringify(filtered.map((item) => item.id)),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe checkout failed.";
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

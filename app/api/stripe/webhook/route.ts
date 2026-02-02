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
    const prisma = getPrisma();
    const listingIds = session.metadata?.listingIds;
    let ids: string[] = [];
    if (listingIds) {
      try {
        ids = JSON.parse(listingIds) as string[];
      } catch (error) {
        console.error("Invalid listingIds metadata:", error);
      }
    }

    if (Array.isArray(ids) && ids.length > 0) {
      await prisma.listing.updateMany({
        where: { id: { in: ids }, status: "ACTIVE" },
        data: { status: "SOLD" },
      });
    }

    const shipping = session.shipping_details;
    const customer = session.customer_details;
    const address = shipping?.address ?? customer?.address ?? null;
    const contactName = shipping?.name ?? customer?.name ?? "";
    const contactEmail = customer?.email ?? session.customer_email ?? "";
    const contactPhone = customer?.phone ?? "";

    let receiptUrl = "";
    let invoiceUrl = "";
    try {
      if (session.invoice) {
        const invoice = await stripe.invoices.retrieve(
          session.invoice as string
        );
        invoiceUrl = invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? "";
      }
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      if (paymentIntentId) {
          const paymentIntent = (await stripe.paymentIntents.retrieve(
            paymentIntentId,
            { expand: ["latest_charge"] }
          )) as Stripe.PaymentIntent;
          const latestCharge = paymentIntent.latest_charge;
          const chargeId =
            typeof latestCharge === "string" ? latestCharge : latestCharge?.id;
          if (chargeId) {
            const charge = await stripe.charges.retrieve(chargeId);
            receiptUrl = charge.receipt_url ?? "";
          }
      }
    } catch (error) {
      console.error("Failed to load Stripe receipt/invoice:", error);
    }

    try {
      await prisma.sale.upsert({
        where: { stripeSessionId: session.id },
        create: {
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          listingIds: Array.isArray(ids) ? ids : [],
          amountTotalCents: session.amount_total ?? null,
          currency: session.currency ?? null,
          buyerEmail: contactEmail || null,
          buyerName: contactName || null,
          buyerPhone: contactPhone || null,
          shippingLine1: address?.line1 ?? null,
          shippingLine2: address?.line2 ?? null,
          shippingCity: address?.city ?? null,
          shippingState: address?.state ?? null,
          shippingPostal: address?.postal_code ?? null,
          shippingCountry: address?.country ?? null,
          receiptUrl: receiptUrl || null,
          invoiceUrl: invoiceUrl || null,
          createdAt: session.created
            ? new Date(session.created * 1000)
            : new Date(),
        },
        update: {
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          listingIds: Array.isArray(ids) ? ids : [],
          amountTotalCents: session.amount_total ?? null,
          currency: session.currency ?? null,
          buyerEmail: contactEmail || null,
          buyerName: contactName || null,
          buyerPhone: contactPhone || null,
          shippingLine1: address?.line1 ?? null,
          shippingLine2: address?.line2 ?? null,
          shippingCity: address?.city ?? null,
          shippingState: address?.state ?? null,
          shippingPostal: address?.postal_code ?? null,
          shippingCountry: address?.country ?? null,
          receiptUrl: receiptUrl || null,
          invoiceUrl: invoiceUrl || null,
        },
      });
    } catch (error) {
      console.error("Failed to store sale:", error);
    }

    if (isEmailConfigured()) {
      const listings =
        Array.isArray(ids) && ids.length > 0
          ? await prisma.listing.findMany({
              where: { id: { in: ids } },
              orderBy: { createdAt: "desc" },
            })
          : [];

      const buyerEmail =
        session.customer_details?.email ?? session.customer_email ?? "";
      const adminEmail = process.env.EMAIL_TO ?? "";
      const adminRecipients = adminEmail
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);

      const shippingDetailsText = [
        contactName ? `Name: ${contactName}` : null,
        contactEmail ? `Email: ${contactEmail}` : null,
        contactPhone ? `Phone: ${contactPhone}` : null,
        address?.line1 ? `Address 1: ${address.line1}` : null,
        address?.line2 ? `Address 2: ${address.line2}` : null,
        address?.city ? `City: ${address.city}` : null,
        address?.state ? `State: ${address.state}` : null,
        address?.postal_code ? `Postal code: ${address.postal_code}` : null,
        address?.country ? `Country: ${address.country}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const itemsText = listings
        .map(
          (listing) =>
            `• ${listing.title} — $${(listing.priceCents / 100).toFixed(0)}`
        )
        .join("\n");
      const shippingCents = session.metadata?.shippingCents
        ? Number(session.metadata.shippingCents)
        : 0;
      const taxCents = session.metadata?.taxCents
        ? Number(session.metadata.taxCents)
        : 0;
      const chargesText = [
        shippingCents > 0
          ? `Shipping: $${(shippingCents / 100).toFixed(2)}`
          : null,
        taxCents > 0 ? `Estimated tax: $${(taxCents / 100).toFixed(2)}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const messageText = [
        "Purchase completed.",
        "",
        "Items:",
        itemsText || "No items found.",
        chargesText ? "" : null,
        chargesText || null,
        "",
        "Shipping:",
        shippingDetailsText || "No shipping details provided.",
        "",
        "Receipt/Invoice:",
        invoiceUrl || receiptUrl || "Receipt not available.",
      ]
        .filter((line) => line !== null && line !== undefined)
        .join("\n");

      const subject = "New card purchase";
      const receiptAttachment = {
        filename: `receipt-${session.id}.txt`,
        content: Buffer.from(messageText, "utf8").toString("base64"),
        type: "text/plain",
      };

      try {
        if (buyerEmail) {
          await sendEmail({
            to: buyerEmail,
            subject: "Your Cardboard Kings order",
            text: messageText,
            attachments: [receiptAttachment],
          });
        }
        if (adminRecipients.length > 0) {
          await Promise.all(
            adminRecipients.map((email) =>
              sendEmail({
                to: email,
                subject,
                text: messageText,
                attachments: [receiptAttachment],
              })
            )
          );
        }
      } catch (error) {
        console.error("Email send failed:", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}

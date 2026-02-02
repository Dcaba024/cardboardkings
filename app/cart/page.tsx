"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function CartPage() {
  const { items, cartCount, removeItem, clear } = useCart();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const isStripeConfigured = Boolean(stripePublishableKey);
  const checkoutDisabled = !isStripeConfigured;

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );
  const shipping = subtotal > 0 ? 15 : 0;
  const tax = 0;
  const total = subtotal + shipping;

  useEffect(() => {
    if (checkoutSuccess) {
      clear();
    }
  }, [checkoutSuccess, clear]);

  const handleCheckout = async () => {
    setCheckoutError(null);
    setCheckoutSuccess(null);
    const missingFields: string[] = [];
    if (!shippingDetails.fullName.trim()) missingFields.push("Full name");
    if (!shippingDetails.email.trim()) {
      missingFields.push("Email address");
    } else if (!/^\S+@\S+\.\S+$/.test(shippingDetails.email)) {
      missingFields.push("Valid email address");
    }
    if (!shippingDetails.address.trim()) missingFields.push("Street address");
    if (!shippingDetails.city.trim()) missingFields.push("City");
    if (!shippingDetails.state.trim()) missingFields.push("State");
    if (!shippingDetails.zip.trim()) missingFields.push("Zip code");
    if (missingFields.length > 0) {
      setCheckoutError(`Please complete: ${missingFields.join(", ")}.`);
      return;
    }
    if (!isStripeConfigured) {
      setCheckoutError("Checkout is unavailable right now. Stripe is not configured.");
      return;
    }
    if (items.length === 0 || isCheckingOut) {
      return;
    }
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
          })),
          charges: {
            shippingCents: Math.round(shipping * 100),
          },
          shipping: {
            name: shippingDetails.fullName.trim(),
            email: shippingDetails.email.trim(),
            address: shippingDetails.address.trim(),
            city: shippingDetails.city.trim(),
            state: shippingDetails.state.trim(),
            zip: shippingDetails.zip.trim(),
          },
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Checkout failed.");
      }
      const data = (await response.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("Checkout failed to start.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed.";
      setCheckoutError(
        message === "Stripe is not configured."
          ? "Checkout is unavailable right now. Stripe is not configured."
          : message
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black py-16 px-8">
      <main className="mx-auto w-full max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-yellow-400 font-[var(--font-cinzel)] uppercase tracking-[0.08em]">
            Cart & Checkout
          </h1>
          <p className="text-lg text-zinc-600 dark:text-yellow-300">
            {cartCount > 0
              ? `${cartCount} item${cartCount === 1 ? "" : "s"} in your cart`
              : "Your cart is empty."}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
            <p className="text-zinc-600 dark:text-zinc-300 mb-6">
              Browse the marketplace to add cards to your cart.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-2 text-sm font-semibold text-black hover:bg-yellow-500"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-yellow-300">
                  Cart items
                </h2>
                <button
                  onClick={clear}
                  className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-yellow-300"
                >
                  Clear cart
                </button>
              </div>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:flex-row md:items-center"
                  >
                    <div className="relative h-32 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 md:h-28 md:w-24">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-yellow-300">
                        {item.name}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                      <span className="text-lg font-semibold text-zinc-900 dark:text-yellow-300">
                        {priceFormatter.format(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-yellow-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-yellow-300 mb-4">
                  Shipping details
                </h2>
                <div className="grid min-w-0 gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Full name"
                    required
                    value={shippingDetails.fullName}
                    onChange={(event) =>
                      setShippingDetails((prev) => ({
                        ...prev,
                        fullName: event.target.value,
                      }))
                    }
                    className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  />
                  <input
                    type="text"
                    placeholder="Email address"
                    required
                    value={shippingDetails.email}
                    onChange={(event) =>
                      setShippingDetails((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  />
                  <input
                    type="text"
                    placeholder="Street address"
                    required
                    value={shippingDetails.address}
                    onChange={(event) =>
                      setShippingDetails((prev) => ({
                        ...prev,
                        address: event.target.value,
                      }))
                    }
                    className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={shippingDetails.city}
                    onChange={(event) =>
                      setShippingDetails((prev) => ({
                        ...prev,
                        city: event.target.value,
                      }))
                    }
                    className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={shippingDetails.state}
                    onChange={(event) =>
                      setShippingDetails((prev) => ({
                        ...prev,
                        state: event.target.value,
                      }))
                    }
                    className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  />
                  <input
                    type="text"
                    placeholder="Zip code"
                    required
                    value={shippingDetails.zip}
                    onChange={(event) =>
                      setShippingDetails((prev) => ({
                        ...prev,
                        zip: event.target.value,
                      }))
                    }
                    className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  />
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-yellow-300 mb-4">
                  Order summary
                </h2>
                {checkoutSuccess ? (
                  <p className="mb-3 text-sm text-emerald-600 dark:text-emerald-400">
                    {checkoutSuccess}
                  </p>
                ) : null}
                {checkoutError ? (
                  <p className="mb-3 text-sm text-red-500">
                    {checkoutError}
                  </p>
                ) : null}
                <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>{priceFormatter.format(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span>{priceFormatter.format(shipping)}</span>
                  </div>
                  <div className="border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900 dark:border-zinc-700 dark:text-yellow-300">
                    <div className="flex items-center justify-between">
                      <span>Total</span>
                      <span>{priceFormatter.format(total)}</span>
                    </div>
                  </div>
                </div>
                {!isStripeConfigured ? (
                  <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 text-center">
                    Checkout is unavailable right now. Stripe is not configured.
                  </p>
                ) : null}
                {isCheckingOut ? (
                  <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 text-center">
                    Redirecting to Stripe Checkout...
                  </p>
                ) : null}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutDisabled || items.length === 0 || isCheckingOut}
                  className="mt-6 w-full rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-black hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCheckingOut ? "Processing..." : "Proceed to checkout"}
                </button>
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  Taxes and shipping calculated at checkout.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-yellow-300 mb-4">
                  Promo code
                </h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 min-w-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  />
                  <button className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300">
                    Apply
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

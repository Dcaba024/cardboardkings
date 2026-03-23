"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

type Listing = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  status: "ACTIVE" | "SOLD";
  createdAt: string;
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function CardDetailsClient({
  listing,
}: {
  listing: Listing;
}) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const inCart = useMemo(
    () => items.some((item) => item.id === listing.id),
    [items, listing.id]
  );

  const handleAddToCart = () => {
    addItem({
      id: listing.id,
      name: listing.title,
      price: listing.priceCents / 100,
      image: listing.imageUrl,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-8 py-16 font-serif dark:bg-black">
      <main className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/cards"
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-yellow-300"
          >
            ← Back to cards
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="relative aspect-[4/5] w-full bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                Card details
              </p>
              <h1 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-yellow-300">
                {listing.title}
              </h1>
              <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
                {listing.description}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-[0.25em] text-zinc-400">
                  Price
                </span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-yellow-300">
                  {priceFormatter.format(listing.priceCents / 100)}
                </span>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={inCart || listing.status !== "ACTIVE"}
                  className={`w-full rounded-full px-5 py-3 text-sm font-semibold transition ${
                    inCart || listing.status !== "ACTIVE"
                      ? "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      : "bg-yellow-400 text-black hover:bg-yellow-500"
                  }`}
                >
                  {listing.status !== "ACTIVE"
                    ? "Sold"
                    : inCart
                    ? "Already in cart"
                    : "Add to cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={listing.status !== "ACTIVE"}
                  className="w-full rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300"
                >
                  Buy now
                </button>
              </div>
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Listed on {new Date(listing.createdAt).toLocaleDateString()} · Status{" "}
              {listing.status.toLowerCase()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

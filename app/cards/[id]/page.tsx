"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function CardDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, items } = useCart();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listingId = typeof params?.id === "string" ? params.id : "";
  const inCart = useMemo(
    () => items.some((item) => item.id === listingId),
    [items, listingId]
  );

  useEffect(() => {
    if (!listingId) {
      setError("Listing not found.");
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    const loadListing = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/listings/${listingId}`);
        const data = (await response.json().catch(() => null)) as Listing | {
          error?: string;
        } | null;
        if (!response.ok || !data || "error" in data) {
          throw new Error(data && "error" in data ? data.error : "Listing not found.");
        }
        if (isMounted) {
          setListing(data as Listing);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load listing.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadListing();
    return () => {
      isMounted = false;
    };
  }, [listingId]);

  const handleAddToCart = () => {
    if (!listing) {
      return;
    }
    addItem({
      id: listing.id,
      name: listing.title,
      price: listing.priceCents / 100,
      image: listing.imageUrl,
    });
  };

  const handleBuyNow = () => {
    if (!listing) {
      return;
    }
    handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black py-16 px-8">
      <main className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/cards"
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-yellow-300"
          >
            ← Back to cards
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
            Loading card details...
          </div>
        ) : error || !listing ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
            {error ?? "Listing not found."}
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="relative aspect-[4/5] w-full bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-cover"
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
        )}
      </main>
    </div>
  );
}

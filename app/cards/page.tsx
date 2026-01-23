"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type CardItem = {
  id: string;
  name: string;
  player: string;
  set: string;
  description: string;
  price: number;
  image: string;
};

const cards: CardItem[] = [];

export default function CardsPage() {
  const { addItem, items } = useCart();
  const [sortBy, setSortBy] = useState("featured");
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [listings, setListings] = useState<CardItem[]>(cards);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      const response = await fetch("/api/listings");
      if (response.ok) {
        const data = await response.json();
        const mapped = (data as Array<{
          id: string;
          title: string;
          description: string;
          priceCents: number;
          imageUrl: string;
        }>).map((listing) => ({
          id: listing.id,
          name: listing.title,
          player: listing.title,
          set: "Listing",
          description: listing.description,
          price: listing.priceCents / 100,
          image: listing.imageUrl,
        }));
        setListings(mapped);
      }
      setIsLoading(false);
    };

    void fetchListings();
  }, []);

  const filteredCards = useMemo(() => {
    const min = minPrice.trim() === "" ? Number.NaN : Number(minPrice);
    const max = maxPrice.trim() === "" ? Number.NaN : Number(maxPrice);
    return listings
      .filter((card) =>
        `${card.name} ${card.set} ${card.description}`.toLowerCase().includes(query.toLowerCase())
      )
      .filter((card) => (Number.isNaN(min) ? true : card.price >= min))
      .filter((card) => (Number.isNaN(max) ? true : card.price <= max))
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "name-asc") return a.player.localeCompare(b.player);
        if (sortBy === "name-desc") return b.player.localeCompare(a.player);
        return 0;
      });
  }, [listings, maxPrice, minPrice, query, sortBy]);

  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black py-16 px-8">
      <main className="mx-auto w-full max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-yellow-400 font-[var(--font-cinzel)] uppercase tracking-[0.08em]">
            Cards for sale
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-yellow-300">
            Browse the full inventory and sort by price or player.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="grid gap-4 md:grid-cols-4">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by player or set"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 md:col-span-2"
            />
            <div className="flex gap-3">
              <input
                type="number"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="Min price"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Max price"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              />
            </div>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Player: A-Z</option>
              <option value="name-desc">Player: Z-A</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
              Loading listings...
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
              No cards match your filters yet.
            </div>
          ) : (
            filteredCards.map((card) => {
              const inCart = items.some((item) => item.id === card.id);
              return (
                <div
                  key={card.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="relative aspect-[4/5] w-full bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      src={card.image}
                      alt={`${card.player} card`}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div>
                      <h2 className="text-xl font-semibold text-zinc-900 dark:text-yellow-300">
                        {card.player}
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {card.set}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {card.description}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-yellow-400">
                      {priceFormatter.format(card.price)}
                    </div>
                    <button
                      onClick={() =>
                        addItem({
                          id: card.id,
                          name: card.player,
                          price: card.price,
                          image: card.image,
                        })
                      }
                      disabled={inCart}
                      className={`mt-auto rounded-full px-4 py-2 text-sm font-semibold transition ${
                        inCart
                          ? "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                          : "bg-yellow-400 text-black hover:bg-yellow-500"
                      }`}
                    >
                      {inCart ? "Already in cart" : "Add to cart"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

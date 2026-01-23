"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const initialListings: Listing[] = [];

export default function AdminDashboard() {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const active = listings.filter((listing) => listing.status === "ACTIVE").length;
    const sold = listings.filter((listing) => listing.status === "SOLD").length;
    return { active, sold, total: listings.length };
  }, [listings]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      const response = await fetch("/api/listings");
      if (response.ok) {
        const data = (await response.json()) as Listing[];
        setListings(data);
      }
      setIsLoading(false);
    };

    void fetchListings();
  }, []);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });

  const handleCreateListing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedImage = imageUrl.trim();
    const numericPrice = Number(price);
    const finalImage = trimmedImage || (imageFile ? await readFileAsDataUrl(imageFile) : previewUrl);
    if (!trimmedTitle || !trimmedDescription || !finalImage || Number.isNaN(numericPrice) || numericPrice <= 0) {
      return;
    }

    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;

    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title: trimmedTitle,
        description: trimmedDescription,
        priceCents: Math.round(numericPrice * 100),
        imageUrl: finalImage,
        status: "ACTIVE",
      }),
    });

    if (response.ok) {
      const created = (await response.json()) as Listing;
      setListings((prev) => [created, ...prev]);
    } else {
      const data = await response.json().catch(() => null);
      setFormError(data?.error ?? "Failed to save listing.");
    }

    setTitle("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setImageFile(null);
  };

  const toggleStatus = async (id: string) => {
    const target = listings.find((listing) => listing.id === id);
    if (!target) {
      return;
    }
    const nextStatus = target.status === "ACTIVE" ? "SOLD" : "ACTIVE";
    const response = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (response.ok) {
      const updated = (await response.json()) as Listing;
      setListings((prev) =>
        prev.map((listing) => (listing.id === id ? updated : listing))
      );
    }
  };

  const removeListing = async (id: string) => {
    const response = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    if (response.ok) {
      setListings((prev) => prev.filter((listing) => listing.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-3xl font-semibold text-zinc-900 dark:text-yellow-300">
            {stats.total}
          </p>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Total cards
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-3xl font-semibold text-zinc-900 dark:text-yellow-300">
            {stats.active}
          </p>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Active
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-3xl font-semibold text-zinc-900 dark:text-yellow-300">
            {stats.sold}
          </p>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Sold
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-yellow-300 mb-4">
          Add a card
        </h2>
        {formError ? (
          <p className="mb-4 text-sm text-red-500">
            {formError}
          </p>
        ) : null}
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleCreateListing}>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Card title"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 md:col-span-2"
          />
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short description"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 md:col-span-2"
          />
          <input
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Price (USD)"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
          <div className="md:col-span-2 grid gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
            <input
              type="text"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="Or paste image URL / path"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-yellow-400 px-6 py-2 text-sm font-semibold text-black hover:bg-yellow-500 md:col-span-1"
          >
            Add listing
          </button>
        </form>
        {previewUrl ? (
          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-28 w-20 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={previewUrl}
                alt="Selected card preview"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Selected image preview
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
            Loading listings...
          </div>
        ) : listings.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
            No listings yet. Add your first card above.
          </div>
        ) : listings.map((listing) => (
          <div
            key={listing.id}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="relative aspect-[4/5] w-full bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-yellow-300">
                  {listing.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {listing.description}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Listed on {new Date(listing.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold text-zinc-900 dark:text-yellow-300">
                  {priceFormatter.format(listing.priceCents / 100)}
                </span>
                <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  {listing.status}
                </span>
              </div>
              <div className="mt-auto flex gap-3">
                <button
                  onClick={() => toggleStatus(listing.id)}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300"
                >
                  Toggle status
                </button>
                <button
                  onClick={() => removeListing(listing.id)}
                  className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

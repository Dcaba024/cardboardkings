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
type EditDraft = {
  title: string;
  description: string;
  price: string;
  imageFile: File | null;
  previewUrl: string | null;
};

export default function AdminDashboard() {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successPulse, setSuccessPulse] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [editDrafts, setEditDrafts] = useState<Record<string, EditDraft>>({});

  useEffect(() => {
    if (!successPulse) return;
    const timeout = setTimeout(() => setSuccessPulse(false), 400);
    return () => clearTimeout(timeout);
  }, [successPulse]);

  useEffect(() => {
    if (!successMessage) return;
    setSuccessVisible(true);
    const hideTimeout = setTimeout(() => setSuccessVisible(false), 2200);
    const clearTimeoutId = setTimeout(() => setSuccessMessage(null), 2600);
    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(clearTimeoutId);
    };
  }, [successMessage]);

  const showError = (message: string) => {
    setFormError(message);
    if (typeof window !== "undefined") {
      window.alert(message);
    }
  };

  const stats = useMemo(() => {
    const active = listings.filter((listing) => listing.status === "ACTIVE").length;
    const sold = listings.filter((listing) => listing.status === "SOLD").length;
    return { active, sold, total: listings.length };
  }, [listings]);

  const activeListings = useMemo(
    () => listings.filter((listing) => listing.status === "ACTIVE"),
    [listings]
  );

  const soldListings = useMemo(
    () => listings.filter((listing) => listing.status === "SOLD"),
    [listings]
  );

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

  const startEdit = (listing: Listing) => {
    if (editingIds.includes(listing.id)) {
      return;
    }
    setEditingIds((prev) => [...prev, listing.id]);
    setEditDrafts((prev) => ({
      ...prev,
      [listing.id]: {
        title: listing.title,
        description: listing.description,
        price: String(listing.priceCents / 100),
        imageFile: null,
        previewUrl: listing.imageUrl,
      },
    }));
  };

  const cancelEdit = (id: string) => {
    const draft = editDrafts[id];
    if (draft?.imageFile && draft.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(draft.previewUrl);
    }
    setEditingIds((prev) => prev.filter((editingId) => editingId !== id));
    setEditDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateDraft = (id: string, updates: Partial<EditDraft>) => {
    setEditDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  };

  const saveEdit = async (id: string) => {
    const draft = editDrafts[id];
    if (!draft) {
      return;
    }
    const trimmedTitle = draft.title.trim();
    const trimmedDescription = draft.description.trim();
    const numericPrice = Number(draft.price);
    const finalImage = draft.imageFile
      ? await readFileAsDataUrl(draft.imageFile)
      : draft.previewUrl;
    if (!trimmedTitle || !trimmedDescription || !finalImage || Number.isNaN(numericPrice) || numericPrice <= 0) {
      showError("Please complete every field with valid values before saving.");
      return;
    }
    const response = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trimmedTitle,
        description: trimmedDescription,
        priceCents: Math.round(numericPrice * 100),
        imageUrl: finalImage,
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      showError(data?.error ?? "Failed to update listing.");
      return;
    }
    const updated = (await response.json()) as Listing;
    setListings((prev) => prev.map((listing) => (listing.id === id ? updated : listing)));
    cancelEdit(id);
    setSuccessMessage("Listing updated.");
    setSuccessPulse(true);
  };

  const handleCreateListing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const numericPrice = Number(price);
    const finalImage = imageFile ? await readFileAsDataUrl(imageFile) : previewUrl;
    if (!trimmedTitle || !trimmedDescription || !finalImage || Number.isNaN(numericPrice) || numericPrice <= 0) {
      showError("Please complete every field with valid values before submitting.");
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
      setTitle("");
      setDescription("");
      setPrice("");
      setImageFile(null);
      setFileInputKey((prev) => prev + 1);
      setFormError(null);
      setSuccessMessage("Listing added.");
      setSuccessPulse(true);
    } else {
      const data = await response.json().catch(() => null);
      showError(data?.error ?? "Failed to save listing.");
    }
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
        {successMessage ? (
          <p
            className={`mb-4 text-sm text-emerald-600 transition-all duration-300 dark:text-emerald-400 ${
              successPulse ? "animate-pulse" : ""
            } ${successVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
          >
            {successMessage}
          </p>
        ) : null}
        {formError ? (
          <p className="mb-4 text-sm text-red-500">
            {formError}
          </p>
        ) : null}
        <form className="grid min-w-0 gap-4 md:grid-cols-3" onSubmit={handleCreateListing}>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Card title"
            required
            className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 md:col-span-2"
          />
          <input
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Price (USD)"
            min="1"
            step="1"
            required
            className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short description"
            required
            rows={5}
            className="w-full min-w-0 resize-y rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 md:col-span-2"
          />
          <div className="md:col-span-2 grid gap-3">
            <input
              key={fileInputKey}
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              required
              className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            />
            {!imageFile && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Image required.
              </p>
            )}
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

      <section className="space-y-10">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-yellow-300">
            Active listings
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {isLoading ? (
              <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                Loading listings...
              </div>
            ) : activeListings.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                No active listings yet. Add your first card above.
              </div>
            ) : (
              activeListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="relative aspect-[4/5] w-full bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      src={editDrafts[listing.id]?.previewUrl ?? listing.imageUrl}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    {editingIds.includes(listing.id) ? (
                      <div className="grid gap-3">
                        <input
                          type="text"
                          value={editDrafts[listing.id]?.title ?? ""}
                          onChange={(event) =>
                            updateDraft(listing.id, { title: event.target.value })
                          }
                          placeholder="Title"
                          className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        />
                        <textarea
                          value={editDrafts[listing.id]?.description ?? ""}
                          onChange={(event) =>
                            updateDraft(listing.id, { description: event.target.value })
                          }
                          placeholder="Description"
                          rows={4}
                          className="w-full min-w-0 resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        />
                        <input
                          type="number"
                          value={editDrafts[listing.id]?.price ?? ""}
                          onChange={(event) =>
                            updateDraft(listing.id, { price: event.target.value })
                          }
                          placeholder="Price (USD)"
                          min="1"
                          step="1"
                          className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            if (!file) {
                              return;
                            }
                            const objectUrl = URL.createObjectURL(file);
                            const previous = editDrafts[listing.id]?.previewUrl;
                            if (previous && previous.startsWith("blob:")) {
                              URL.revokeObjectURL(previous);
                            }
                            updateDraft(listing.id, {
                              imageFile: file,
                              previewUrl: objectUrl,
                            });
                          }}
                          className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        />
                      </div>
                    ) : (
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
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold text-zinc-900 dark:text-yellow-300">
                        {priceFormatter.format(listing.priceCents / 100)}
                      </span>
                      <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                        {listing.status}
                      </span>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-3">
                      {editingIds.includes(listing.id) ? (
                        <>
                          <button
                            onClick={() => saveEdit(listing.id)}
                            className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => cancelEdit(listing.id)}
                            className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(listing)}
                            className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(listing.id)}
                            className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300"
                          >
                            Mark sold
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-yellow-300">
            Sold listings
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {isLoading ? (
              <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                Loading listings...
              </div>
            ) : soldListings.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                No sold cards yet.
              </div>
            ) : (
              soldListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="relative aspect-[4/5] w-full bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      src={editDrafts[listing.id]?.previewUrl ?? listing.imageUrl}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    {editingIds.includes(listing.id) ? (
                      <div className="grid gap-3">
                        <input
                          type="text"
                          value={editDrafts[listing.id]?.title ?? ""}
                          onChange={(event) =>
                            updateDraft(listing.id, { title: event.target.value })
                          }
                          placeholder="Title"
                          className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        />
                        <textarea
                          value={editDrafts[listing.id]?.description ?? ""}
                          onChange={(event) =>
                            updateDraft(listing.id, { description: event.target.value })
                          }
                          placeholder="Description"
                          rows={4}
                          className="w-full min-w-0 resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        />
                        <input
                          type="number"
                          value={editDrafts[listing.id]?.price ?? ""}
                          onChange={(event) =>
                            updateDraft(listing.id, { price: event.target.value })
                          }
                          placeholder="Price (USD)"
                          min="1"
                          step="1"
                          className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            if (!file) {
                              return;
                            }
                            const objectUrl = URL.createObjectURL(file);
                            const previous = editDrafts[listing.id]?.previewUrl;
                            if (previous && previous.startsWith("blob:")) {
                              URL.revokeObjectURL(previous);
                            }
                            updateDraft(listing.id, {
                              imageFile: file,
                              previewUrl: objectUrl,
                            });
                          }}
                          className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-yellow-300">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {listing.description}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Sold on {new Date(listing.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold text-zinc-900 dark:text-yellow-300">
                        {priceFormatter.format(listing.priceCents / 100)}
                      </span>
                      <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                        {listing.status}
                      </span>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-3">
                      {editingIds.includes(listing.id) ? (
                        <>
                          <button
                            onClick={() => saveEdit(listing.id)}
                            className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => cancelEdit(listing.id)}
                            className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(listing)}
                            className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(listing.id)}
                            className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => removeListing(listing.id)}
                            className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-300"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

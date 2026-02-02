"use client";

import { useEffect, useMemo, useState } from "react";

type SaleRecord = {
  id: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  listingIds: string[];
  listingTitles: string[];
  listingImages: string[];
  amountTotalCents: number | null;
  currency: string | null;
  buyerEmail: string | null;
  buyerName: string | null;
  buyerPhone: string | null;
  shippingLine1: string | null;
  shippingLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostal: string | null;
  shippingCountry: string | null;
  receiptUrl: string | null;
  invoiceUrl: string | null;
  createdAt: string;
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function SalesDashboard() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    shippingLine1: "",
    shippingLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostal: "",
    shippingCountry: "",
  });
  const [editError, setEditError] = useState<string | null>(null);

  const fetchSales = async () => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    if (minTotal) params.set("min", minTotal);
    if (maxTotal) params.set("max", maxTotal);

    const response = await fetch(`/api/admin/sales?${params.toString()}`);
    if (!response.ok) {
      setError("Failed to load sales.");
      setIsLoading(false);
      return;
    }
    const data = (await response.json()) as { sales: SaleRecord[] };
    setSales(data.sales ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchSales();
  }, []);

  const stats = useMemo(() => {
    const totalCents = sales.reduce(
      (sum, sale) => sum + (sale.amountTotalCents ?? 0),
      0
    );
    const avg =
      sales.length > 0 ? Math.round(totalCents / sales.length) : 0;
    return {
      count: sales.length,
      total: totalCents,
      average: avg,
    };
  }, [sales]);

  const formatMoney = (amountCents: number | null) => {
    if (amountCents == null) return "—";
    return priceFormatter.format(amountCents / 100);
  };

  const startEdit = (sale: SaleRecord) => {
    setEditingSaleId(sale.id);
    setEditError(null);
    setEditDraft({
      buyerName: sale.buyerName ?? "",
      buyerEmail: sale.buyerEmail ?? "",
      buyerPhone: sale.buyerPhone ?? "",
      shippingLine1: sale.shippingLine1 ?? "",
      shippingLine2: sale.shippingLine2 ?? "",
      shippingCity: sale.shippingCity ?? "",
      shippingState: sale.shippingState ?? "",
      shippingPostal: sale.shippingPostal ?? "",
      shippingCountry: sale.shippingCountry ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingSaleId(null);
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editingSaleId) return;
    setEditError(null);
    const response = await fetch(`/api/admin/sales/${editingSaleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editDraft),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setEditError(data?.error ?? "Failed to update shipping details.");
      return;
    }
    const data = (await response.json()) as { sale: SaleRecord };
    setSales((prev) =>
      prev.map((sale) => (sale.id === data.sale.id ? data.sale : sale))
    );
    setEditingSaleId(null);
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Total sales
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-yellow-300">
            {stats.count}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Gross revenue
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-yellow-300">
            {priceFormatter.format(stats.total / 100)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Average order
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-yellow-300">
            {priceFormatter.format(stats.average / 100)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-yellow-300">
              Transactions
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Filter by customer, date, or order size.
            </p>
          </div>
          <button
            onClick={fetchSales}
            className="rounded-full bg-yellow-400 px-5 py-2 text-sm font-semibold text-black hover:bg-yellow-500"
          >
            Apply filters
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, session..."
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
          <input
            type="number"
            value={minTotal}
            onChange={(event) => setMinTotal(event.target.value)}
            placeholder="Min total"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
          <input
            type="number"
            value={maxTotal}
            onChange={(event) => setMaxTotal(event.target.value)}
            placeholder="Max total"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 px-4 py-4 sm:px-6 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-yellow-300">
            Recent orders
          </h3>
        </div>
        <div className="px-4 py-6 sm:px-6">
          {isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading sales...
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : null}
          {!isLoading && sales.length === 0 && !error ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No transactions found yet.
            </p>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(sale.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-yellow-300">
                      {sale.buyerName || "Customer"}
                    </p>
                    <p className="break-all text-sm text-zinc-600 dark:text-zinc-400">
                      {sale.buyerEmail || "No email provided"}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold text-zinc-900 dark:text-yellow-300">
                      {formatMoney(sale.amountTotalCents)}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                      {sale.currency?.toUpperCase() ?? "USD"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                      Items
                    </p>
                    <div className="mt-2 space-y-2">
                      {sale.listingTitles.length > 0 ? (
                        sale.listingTitles.map((title, index) => (
                          <div
                            key={`${sale.id}-${title}-${index}`}
                            className="flex items-center gap-3"
                          >
                            {sale.listingImages?.[index] ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewImage({
                                    url: sale.listingImages[index],
                                    title,
                                  })
                                }
                                className="h-12 w-12 flex-none overflow-hidden rounded-lg ring-offset-2 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-300"
                                aria-label={`Preview ${title}`}
                              >
                                <img
                                  src={sale.listingImages[index]}
                                  alt={title}
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                            )}
                            <span className="min-w-0 break-words text-sm text-zinc-700 dark:text-zinc-300">
                              {title}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          No item details
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                      Shipping
                    </p>
                    <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <p className="break-words">{sale.shippingLine1 ?? "No address"}</p>
                      {sale.shippingLine2 ? <p>{sale.shippingLine2}</p> : null}
                      <p>
                        {[sale.shippingCity, sale.shippingState]
                          .filter(Boolean)
                          .join(", ")}{" "}
                        {sale.shippingPostal ?? ""}
                      </p>
                      <p>{sale.shippingCountry ?? ""}</p>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {sale.buyerPhone ?? ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  {sale.receiptUrl ? (
                    <a
                      href={sale.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-zinc-300 px-3 py-1 text-zinc-700 hover:border-yellow-400 hover:text-yellow-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-yellow-300 dark:hover:text-yellow-300"
                    >
                      Receipt
                    </a>
                  ) : null}
                  {sale.invoiceUrl ? (
                    <a
                      href={sale.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-zinc-300 px-3 py-1 text-zinc-700 hover:border-yellow-400 hover:text-yellow-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-yellow-300 dark:hover:text-yellow-300"
                    >
                      Invoice
                    </a>
                  ) : null}
                  <span className="break-all text-xs text-zinc-400">
                    Session: {sale.stripeSessionId}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(sale)}
                    className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 hover:border-yellow-400 hover:text-yellow-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-yellow-300 dark:hover:text-yellow-300"
                  >
                    Edit shipping
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {previewImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-sm font-semibold text-black shadow hover:bg-yellow-500"
            >
              Close
            </button>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] w-full object-contain sm:max-h-[80vh]"
              />
              <div className="border-t border-zinc-200 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                {previewImage.title}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {editingSaleId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={cancelEdit}
        >
          <div
            className="relative w-full max-w-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
              <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-yellow-300">
                  Edit shipping details
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Update customer contact info and address.
                </p>
              </div>
              <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
                <input
                  type="text"
                  value={editDraft.buyerName}
                  onChange={(event) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      buyerName: event.target.value,
                    }))
                  }
                  placeholder="Customer name"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
                <input
                  type="email"
                  value={editDraft.buyerEmail}
                  onChange={(event) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      buyerEmail: event.target.value,
                    }))
                  }
                  placeholder="Customer email"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
                <input
                  type="text"
                  value={editDraft.buyerPhone}
                  onChange={(event) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      buyerPhone: event.target.value,
                    }))
                  }
                  placeholder="Customer phone"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
                <input
                  type="text"
                  value={editDraft.shippingLine1}
                  onChange={(event) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      shippingLine1: event.target.value,
                    }))
                  }
                  placeholder="Address line 1"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 md:col-span-2"
                />
                <input
                  type="text"
                  value={editDraft.shippingLine2}
                  onChange={(event) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      shippingLine2: event.target.value,
                    }))
                  }
                  placeholder="Address line 2"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 md:col-span-2"
                />
                <input
                  type="text"
                  value={editDraft.shippingCity}
                  onChange={(event) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      shippingCity: event.target.value,
                    }))
                  }
                  placeholder="City"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
                <input
                  type="text"
                  value={editDraft.shippingState}
                  onChange={(event) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      shippingState: event.target.value,
                    }))
                  }
                  placeholder="State"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
                <input
                  type="text"
                  value={editDraft.shippingPostal}
                  onChange={(event) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      shippingPostal: event.target.value,
                    }))
                  }
                  placeholder="Postal code"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
                <input
                  type="text"
                  value={editDraft.shippingCountry}
                  onChange={(event) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      shippingCountry: event.target.value,
                    }))
                  }
                  placeholder="Country"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                />
              </div>
              {editError ? (
                <p className="px-6 pb-2 text-sm text-red-500">{editError}</p>
              ) : null}
              <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-yellow-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-500"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

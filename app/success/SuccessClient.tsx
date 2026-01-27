"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function SuccessClient() {
  const { clear } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    fetch(`/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`, {
      method: "POST",
    }).catch(() => null);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black py-16 px-8">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-yellow-300">
          Payment successful
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Thanks for your purchase. Your cards are now marked as sold.
        </p>
        <Link
          href="/cards"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-2 text-sm font-semibold text-black hover:bg-yellow-500"
        >
          Continue shopping
        </Link>
      </main>
    </div>
  );
}

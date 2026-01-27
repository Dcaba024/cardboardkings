import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black py-16 px-8">
          <main className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-yellow-300">
              Payment successful
            </h1>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Finalizing your order...
            </p>
          </main>
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}

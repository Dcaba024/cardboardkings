import Link from "next/link";

export default function SignedOutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black py-16 px-8">
      <main className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-yellow-300">
          You are signed out
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Thanks for stopping by. Sign back in anytime to manage your orders.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-2 text-sm font-semibold text-black hover:bg-yellow-500"
          >
            Sign in
          </Link>
          <Link
            href="/cards"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-2 text-sm font-semibold text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300"
          >
            Browse cards
          </Link>
        </div>
      </main>
    </div>
  );
}

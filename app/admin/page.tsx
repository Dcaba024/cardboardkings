import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import { getIsAdmin } from "../lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black py-16 px-8">
      <main className="mx-auto w-full max-w-screen-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-yellow-400 font-[var(--font-cinzel)] uppercase tracking-[0.08em]">
            Admin Dashboard
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-yellow-300">
            Manage listings and keep an eye on incoming orders.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="/admin/sales"
              className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-yellow-400 hover:text-yellow-500 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300"
            >
              View sales dashboard
            </a>
          </div>
        </div>
        <AdminDashboard />
      </main>
    </div>
  );
}

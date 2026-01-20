export default function About() {
  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black py-16 px-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black dark:text-yellow-400 mb-8 font-[var(--font-cinzel)] uppercase tracking-[0.08em] text-center">
          About Us
        </h1>
        <div className="text-center">
          <p className="text-lg text-zinc-600 dark:text-yellow-300 mb-8">
            Welcome to Cardboard Kings, your premier sports card cleaning service. We provide professional care for your valuable collectibles.
          </p>
          <h2 className="text-2xl font-semibold text-black dark:text-yellow-400 mb-6">
            Contact Information
          </h2>
          <div className="space-y-4">
            <p className="text-lg text-zinc-600 dark:text-yellow-300">
              <strong>Email:</strong> fdemoya72@gmail.com
            </p>
            <p className="text-lg text-zinc-600 dark:text-yellow-300">
              <strong>Phone:</strong> 201-620-1623
            </p>
            <p className="text-lg text-zinc-600 dark:text-yellow-300">
              <strong>Location:</strong> Lodi, NJ
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
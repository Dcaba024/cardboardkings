export default function Services() {
  const services = [
    {
      title: "Surface Dust Removal",
      description:
        "Careful dry cleaning to lift dust and fibers without disturbing the finish."
    },
    {
      title: "Smudge and Fingerprint Lift",
      description:
        "Gentle cleaning to remove oils and surface marks while protecting gloss."
    },
    {
      title: "Edge and Corner Detail",
      description:
        "Precision cleaning around edges and corners to keep lines crisp."
    },
    {
      title: "Sleeve and Toploader Prep",
      description:
        "Fresh sleeves and clean holders to keep cards protected after service."
    },
    {
      title: "Condition Check",
      description:
        "Quick review of surface, edges, and centering before and after cleaning."
    },
    {
      title: "Bulk Cleaning Packages",
      description:
        "Discounted service for larger submissions with consistent handling."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black py-16 px-8">
      <main className="mx-auto w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black dark:text-yellow-400 mb-4 font-[var(--font-cinzel)] uppercase tracking-[0.08em]">
            Services
          </h1>
          <p className="text-lg text-zinc-600 dark:text-yellow-300">
            Professional cleaning options to keep your cards looking sharp.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-yellow-300 mb-3">
                {service.title}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

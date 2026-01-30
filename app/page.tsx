"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "./context/CartContext";

type CardForSale = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  alt: string;
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCard, setCurrentCard] = useState(0);
  const [addPulse, setAddPulse] = useState(false);
  const [cardsForSale, setCardsForSale] = useState<CardForSale[]>([]);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const { addItem } = useCart();

  const slides = [
    "Your cards deserve the royal treatment",
    "Professional cleaning for collectors",
    "Fast turnaround and reliable service"
  ];

  const images = [
    "/gold.png",
    "/sportscarousel.png",
    "/thirdcarousel.png",
  ];
  useEffect(() => {
    let isActive = true;

    const loadCards = async () => {
      try {
        const response = await fetch("/api/listings", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          return;
        }
        const activeCards = data.filter((listing) => listing?.status === "ACTIVE");
        const shuffled = activeCards.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3).map((listing) => ({
          id: listing.id,
          name: listing.title,
          description: listing.description,
          price: listing.priceCents / 100,
          image: listing.imageUrl,
          alt: `${listing.title} card`,
        }));
        if (isActive) {
          setCardsForSale(selected);
        }
      } finally {
        if (isActive) {
          setCardsLoaded(true);
        }
      }
    };

    loadCards();

    return () => {
      isActive = false;
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const nextCard = () => {
    if (cardsForSale.length < 2) {
      return;
    }
    setCurrentCard((prev) => (prev + 1) % cardsForSale.length);
  };

  const prevCard = () => {
    if (cardsForSale.length < 2) {
      return;
    }
    setCurrentCard((prev) => (prev - 1 + cardsForSale.length) % cardsForSale.length);
  };

  useEffect(() => {
    if (!addPulse) return;
    const timeout = setTimeout(() => setAddPulse(false), 250);
    return () => clearTimeout(timeout);
  }, [addPulse]);

  const handleAddToCart = () => {
    const card = cardsForSale[currentCard];
    if (!card) {
      return;
    }
    addItem({
      id: card.id,
      name: card.name,
      price: card.price,
      image: card.image,
    });
    setAddPulse(true);
  };
  useEffect(() => {
    setCurrentCard(0);
  }, [cardsForSale.length]);

  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black">
      <div className="text-center mb-12">
        <div className="relative w-full mx-auto">
           <p className="text-5xl font-bold text-zinc-600 dark:text-yellow-300 transition-opacity duration-500 text-center pb-0 md:pb-2">
              {slides[currentSlide]}
            </p>
          <div className="overflow-hidden rounded-lg bg-black p-0 md:pt-10 md:px-20 md:pb-20 min-h-[400px] md:min-h-[700px] flex items-center justify-center">
            <div className="relative w-full max-w-[1536px]">
              <Image
                src={images[currentSlide]}
                alt={slides[currentSlide]}
                width={1536}
                height={1024}
                sizes="(max-width: 1536px) 100vw, 1536px"
                className="h-auto w-full"
                priority
              />
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-500"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-500"
                aria-label="Next slide"
              >
                ›
              </button>
            </div>
          </div>
          <div className="flex justify-center mt-4 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide ? 'bg-yellow-400' : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <main className="flex w-full max-w-4xl mx-auto flex-col items-center justify-start py-6 px-8 bg-white dark:bg-black">

        <section className="mb-6">
          <h2 className="text-3xl font-semibold text-black dark:text-yellow-400 mb-6 text-center">
            Our Guarantees
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <h3 className="text-xl font-medium text-black dark:text-yellow-400 mb-2">
                Professional Cleaning
              </h3>
              <p className="text-zinc-600 dark:text-yellow-300">
                Expert care for your valuable sports cards.
              </p>
            </div>
            <div className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <h3 className="text-xl font-medium text-black dark:text-yellow-400 mb-2">
                Mail-in Service
              </h3>
              <p className="text-zinc-600 dark:text-yellow-300">
                Convenient shipping options for your convenience.
              </p>
            </div>
            <div className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <h3 className="text-xl font-medium text-black dark:text-yellow-400 mb-2">
                Fast Turnaround
              </h3>
              <p className="text-zinc-600 dark:text-yellow-300">
                Quick processing to get your cards back to you soon.
              </p>
            </div>
            <div className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <h3 className="text-xl font-medium text-black dark:text-yellow-400 mb-2">
                Collector Approved
              </h3>
              <p className="text-zinc-600 dark:text-yellow-300">
                Trusted by collectors for quality and care.
              </p>
            </div>
          </div>
        </section>

      </main>
      <section className="mx-auto w-full max-w-4xl px-8 pb-8">
        <h2 className="mb-6 text-center text-3xl font-semibold text-zinc-900 dark:text-yellow-400">
          Cards for sale
        </h2>
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          {cardsLoaded && cardsForSale.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
              There are no cards for sale yet but come back and check again later.
            </div>
          ) : (
            <>
              <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr] md:items-center">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                  {cardsForSale[currentCard] && (
                    <Image
                      src={cardsForSale[currentCard].image}
                      alt={cardsForSale[currentCard].alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 220px"
                      className="object-cover"
                    />
                  )}
                  {!cardsForSale[currentCard] && !cardsLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
                  )}
                </div>
                <div className="flex flex-col gap-4 text-left">
                  <div>
                    {cardsForSale[currentCard] ? (
                      <>
                        <h3 className="text-2xl font-semibold text-zinc-900 dark:text-yellow-300">
                          {cardsForSale[currentCard].name}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {cardsForSale[currentCard].description}
                        </p>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                        <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                      </div>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-yellow-400">
                    {cardsForSale[currentCard] ? (
                      priceFormatter.format(cardsForSale[currentCard].price)
                    ) : (
                      <div className="h-9 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={handleAddToCart}
                      disabled={!cardsForSale[currentCard]}
                      className={`rounded-full bg-zinc-900 px-6 py-2 text-sm font-semibold text-white transition-transform duration-150 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 ${
                        addPulse ? "scale-105" : "scale-100"
                      }`}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
              {cardsForSale.length > 1 && (
                <>
                  <button
                    onClick={prevCard}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-yellow-400 p-2 text-black hover:bg-yellow-500"
                    aria-label="Previous card"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextCard}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-yellow-400 p-2 text-black hover:bg-yellow-500"
                    aria-label="Next card"
                  >
                    ›
                  </button>
                </>
              )}
              {cardsForSale.length > 1 && (
                <div className="flex justify-center pb-6">
                  {cardsForSale.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCard(index)}
                      className={`mx-1 h-2 w-2 rounded-full ${
                        index === currentCard ? "bg-yellow-400" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                      aria-label={`Show card ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

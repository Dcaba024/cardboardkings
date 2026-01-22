"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCard, setCurrentCard] = useState(0);

  const slides = [
    "Your cards deserve the royal treatment",
    "Professional cleaning for collectors",
    "Fast turnaround and reliable service"
  ];

  const images = [
    "https://images2.minutemediacdn.com/image/upload/c_crop,x_91,y_235,w_2362,h_1328/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/images/voltaxMediaLibrary/mmsport/si_collects/01kcm7jm5ykvkkfd2q3p.jpg",
    "https://thumbs.dreamstime.com/b/baseball-cards-collection-major-league-48239751.jpg", // Replace with actual image URL
    "https://cdn11.bigcommerce.com/s-cft20qcvqs/images/stencil/original/image-manager/sports-plp-baseball.jpg?t=1674001770"  // Replace with actual image URL
  ];
  const cardsForSale = [
    {
      name: "Jasson Dominguez",
      description: "Bowman Chrome Prospect",
      price: "$1,000",
      image: "/jasson.jpg",
      alt: "Jasson Dominguez Bowman Chrome card"
    },
    {
      name: "Jasson Dominguez",
      description: "Rookie Showcase",
      price: "$850",
      image: "/Dominguez.JPEG",
      alt: "Jasson Dominguez rookie card"
    },
    {
      name: "Julio Rodriguez",
      description: "Topps Chrome",
      price: "$1,200",
      image: "/jasson.jpg",
      alt: "Julio Rodriguez Topps Chrome card"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cardsForSale.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cardsForSale.length) % cardsForSale.length);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black">
      <div className="text-center mb-12">
        <div className="relative w-full mx-auto">
           <p className="text-5xl font-bold text-zinc-600 dark:text-yellow-300 transition-opacity duration-500 text-center pb-0 md:pb-2">
              {slides[currentSlide]}
            </p>
          <div
            className="overflow-hidden rounded-lg bg-black p-0 md:pt-8 md:px-16 md:pb-16 min-h-[300px] md:min-h-[500px] flex items-center justify-start"
            style={{
              backgroundImage: `url('${images[currentSlide]}')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
          </div>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-500"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-500"
          >
            ›
          </button>
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
      <section className="mx-auto w-full max-w-4xl px-8 pb-8">
        <h2 className="mb-6 text-center text-3xl font-semibold text-zinc-900 dark:text-yellow-400">
          Cards for sale
        </h2>
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr] md:items-center">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={cardsForSale[currentCard].image}
                alt={cardsForSale[currentCard].alt}
                fill
                sizes="(max-width: 768px) 100vw, 220px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-4 text-left">
              <div>
                <h3 className="text-2xl font-semibold text-zinc-900 dark:text-yellow-300">
                  {cardsForSale[currentCard].name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {cardsForSale[currentCard].description}
                </p>
              </div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-yellow-400">
                {cardsForSale[currentCard].price}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300">
                  Add to cart
                </button>
                <button className="rounded-full border border-zinc-300 px-6 py-2 text-sm font-semibold text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-yellow-300 dark:hover:border-yellow-300">
                  Buy now
                </button>
              </div>
            </div>
          </div>
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
        </div>
      </section>
      <main className="flex min-h-screen w-full max-w-4xl mx-auto flex-col items-center justify-start py-16 px-8 bg-white dark:bg-black">

        <section className="mb-12">
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
    </div>
  );
}

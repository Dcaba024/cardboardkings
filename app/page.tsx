"use client";

import { useState } from "react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "Your cards deserve the royal treatment",
    "Professional cleaning for collectors",
    "Fast turnaround and reliable service"
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black">
      <div className="text-center mb-12">
        <div className="relative w-full mx-auto">
          <div
            className="overflow-hidden rounded-lg bg-black p-16 min-h-[500px] flex items-center justify-start"
            style={{
              backgroundImage: `url('https://images2.minutemediacdn.com/image/upload/c_crop,x_91,y_235,w_2362,h_1328/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/images/voltaxMediaLibrary/mmsport/si_collects/01kcm7jm5ykvkkfd2q3p.jpg')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <p className="text-xl text-zinc-600 dark:text-yellow-300 transition-opacity duration-500 text-left">
              {slides[currentSlide]}
            </p>
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

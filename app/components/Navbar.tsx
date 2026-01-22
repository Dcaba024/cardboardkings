"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="w-full bg-zinc-100 dark:bg-zinc-800 p-4">
        <div className="w-full flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-4">
              <svg
                width="50"
                height="30"
                viewBox="0 0 100 60"
                className="text-yellow-400"
                fill="currentColor"
              >
                <polygon points="10,50 20,30 30,40 40,20 50,30 60,20 70,40 80,30 90,50" />
                <circle cx="20" cy="35" r="3" />
                <circle cx="40" cy="25" r="3" />
                <circle cx="60" cy="25" r="3" />
                <circle cx="80" cy="35" r="3" />
              </svg>
              <span className="text-xl font-bold text-black dark:text-yellow-400 font-[var(--font-cinzel)] uppercase tracking-[0.08em]">
                Cardboard Kings
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-black dark:text-yellow-400"
            >
              ☰
            </button>
          </div>
            <div className="hidden lg:flex items-center justify-between flex-1 px-6">
            <div className="flex space-x-6">
              <Link href="/services" className="text-black dark:text-yellow-300 hover:text-yellow-500">Services</Link>
              <Link href="/about" className="text-black dark:text-yellow-300 hover:text-yellow-500">About Us</Link>
            </div>
          </div>
        </div>
      </nav>
      <div className={`lg:hidden ${menuOpen ? 'block' : 'hidden'} bg-zinc-100 dark:bg-zinc-800 p-4`}>
        <div className="flex flex-col space-y-2">
          <Link href="/services" className="text-black dark:text-yellow-300 hover:text-yellow-500">Services</Link>
          <Link href="/about" className="text-black dark:text-yellow-300 hover:text-yellow-500">About Us</Link>
        </div>
      </div>
    </>
  );
}

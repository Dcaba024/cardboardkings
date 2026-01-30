"use client";

import Image from "next/image";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { orgRole } = useAuth();
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <nav className="w-full bg-zinc-100 dark:bg-zinc-800 p-4">
        <div className="w-full flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-4">
              <Image
                src="/crown.png"
                alt="Cardboard Kings crown logo"
                width={50}
                height={50}
                className="h-15 w-auto"
                priority
              />
              <span className="text-xl font-bold text-black dark:text-yellow-400 font-[var(--font-cinzel)] uppercase tracking-[0.08em]">
                Cardboard Kings
              </span>
            </Link>
          </div>
          <div className="hidden lg:flex items-center justify-between flex-1 px-6">
            <div className="flex space-x-6">
              <Link href="/cards" className="text-black dark:text-yellow-300 hover:text-yellow-500">Cards for sale</Link>
              <Link href="/services" className="text-black dark:text-yellow-300 hover:text-yellow-500">Services</Link>
              <Link href="/about" className="text-black dark:text-yellow-300 hover:text-yellow-500">About Us</Link>
              {orgRole === "org:admin" ? (
                <Link href="/admin" className="text-black dark:text-yellow-300 hover:text-yellow-500">Admin</Link>
              ) : null}
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-black dark:text-yellow-400"
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-black hover:border-yellow-400 hover:text-yellow-500 dark:border-zinc-700 dark:text-yellow-300"
              aria-label="View cart"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M2 3h2l2.6 11.3a2 2 0 0 0 2 1.7h8.8a2 2 0 0 0 2-1.6l1.5-6.4H6.2" />
              </svg>
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-400 px-1 text-xs font-semibold text-black">
                  {cartCount}
                </span>
              ) : null}
            </Link>
            <SignedOut>
              <SignInButton>
                <button className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500">Login</button>
              </SignInButton>
              <SignUpButton>
                <button className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500">Sign Up</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/signed-out" />
            </SignedIn>
          </div>
        </div>
      </nav>
      <div
        ref={mobileMenuRef}
        data-testid="mobile-menu"
        className={`lg:hidden ${menuOpen ? 'block' : 'hidden'} bg-zinc-100 dark:bg-zinc-800 p-4`}
      >
        <div className="flex flex-col space-y-2">
          <Link
            href="/cards"
            onClick={() => setMenuOpen(false)}
            className="text-black dark:text-yellow-300 hover:text-yellow-500"
          >
            Cards for sale
          </Link>
          <Link
            href="/services"
            onClick={() => setMenuOpen(false)}
            className="text-black dark:text-yellow-300 hover:text-yellow-500"
          >
            Services
          </Link>
          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
            className="text-black dark:text-yellow-300 hover:text-yellow-500"
          >
            About Us
          </Link>
          {orgRole === "org:admin" ? (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="text-black dark:text-yellow-300 hover:text-yellow-500"
            >
              Admin
            </Link>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-black hover:border-yellow-400 hover:text-yellow-500 dark:border-zinc-700 dark:text-yellow-300"
              aria-label="View cart"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M2 3h2l2.6 11.3a2 2 0 0 0 2 1.7h8.8a2 2 0 0 0 2-1.6l1.5-6.4H6.2" />
              </svg>
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-400 px-1 text-xs font-semibold text-black">
                  {cartCount}
                </span>
              ) : null}
            </Link>
            <SignedOut>
              <SignInButton>
                <button className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500">Login</button>
              </SignInButton>
              <SignUpButton>
                <button className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500">Sign Up</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/signed-out" />
            </SignedIn>
          </div>
        </div>
      </div>
    </>
  );
}

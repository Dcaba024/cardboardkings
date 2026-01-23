import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cardboard Kings",
  description: "Professional sports card cleaning service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased`}
        >
          <CartProvider>
            <Navbar />
            {children}
            <footer className="w-full bg-zinc-100 dark:bg-zinc-800 p-4 mt-8">
              <div className="max-w-4xl mx-auto text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  © {new Date().getFullYear()} Cardboard Kings. All rights reserved.
                </p>
              </div>
            </footer>
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  getBaseUrl,
} from "./lib/seo";
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
  metadataBase: getBaseUrl(),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "sports card cleaning",
    "sports card marketplace",
    "card cleaning service",
    "trading card cleaning",
    "sports cards for sale",
    "collector card care",
  ],
  verification: {
    google: "lUAoz-8oNiW3XFB3WHdtip_ZE5lwzl6YhRWfDVVIH_s",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: absoluteUrl("/gold.png"),
        width: 1200,
        height: 1200,
        alt: `${SITE_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/gold.png")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      afterSignOutUrl="/signed-out"
    >
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

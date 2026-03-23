import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "../lib/seo";

const description =
  "Shop active sports card listings from Cardboard Kings, with collector-focused descriptions and pricing.";

export const metadata: Metadata = {
  title: "Cards For Sale",
  description,
  alternates: {
    canonical: "/cards",
  },
  openGraph: {
    title: "Cards For Sale",
    description,
    url: "/cards",
    siteName: SITE_NAME,
    images: [
      {
        url: absoluteUrl("/sportscarousel.png"),
        alt: "Sports cards for sale at Cardboard Kings",
      },
    ],
  },
  twitter: {
    title: "Cards For Sale",
    description,
    images: [absoluteUrl("/sportscarousel.png")],
  },
};

export default function CardsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

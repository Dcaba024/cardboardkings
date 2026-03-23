import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CardDetailsClient from "./CardDetailsClient";
import { getListingById } from "../../lib/listings";
import { SITE_NAME, absoluteUrl } from "../../lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    return {
      title: "Listing Not Found",
      description: "This sports card listing could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = listing.description.slice(0, 155);

  return {
    title: listing.title,
    description,
    alternates: {
      canonical: `/cards/${listing.id}`,
    },
    openGraph: {
      title: listing.title,
      description,
      url: `/cards/${listing.id}`,
      siteName: SITE_NAME,
      images: [
        {
          url: listing.imageUrl,
          alt: listing.title,
        },
      ],
    },
    twitter: {
      title: listing.title,
      description,
      images: [listing.imageUrl],
    },
  };
}

export default async function CardDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: [listing.imageUrl],
    url: absoluteUrl(`/cards/${listing.id}`),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (listing.priceCents / 100).toFixed(2),
      availability:
        listing.status === "ACTIVE"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/cards/${listing.id}`),
      itemCondition: "https://schema.org/UsedCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <CardDetailsClient
        listing={{
          id: listing.id,
          title: listing.title,
          description: listing.description,
          priceCents: listing.priceCents,
          imageUrl: listing.imageUrl,
          status: listing.status as "ACTIVE" | "SOLD",
          createdAt: listing.createdAt.toISOString(),
        }}
      />
    </>
  );
}

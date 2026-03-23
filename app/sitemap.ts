import type { MetadataRoute } from "next";
import { getAllListings } from "./lib/listings";
import { absoluteUrl } from "./lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getAllListings();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/cards"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/services"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: absoluteUrl(`/cards/${listing.id}`),
    lastModified: listing.createdAt,
    changeFrequency: listing.status === "ACTIVE" ? "weekly" : "monthly",
    priority: listing.status === "ACTIVE" ? 0.8 : 0.4,
  }));

  return [...staticPages, ...listingPages];
}

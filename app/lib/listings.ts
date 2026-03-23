import { cache } from "react";
import { getPrisma } from "./prisma";

export type ListingRecord = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  status: string;
  createdAt: Date;
};

export const getActiveListings = cache(async () => {
  const prisma = getPrisma();
  return prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
});

export const getAllListings = cache(async () => {
  const prisma = getPrisma();
  return prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
  });
});

export const getListingById = cache(async (id: string) => {
  const prisma = getPrisma();
  return prisma.listing.findUnique({ where: { id } });
});

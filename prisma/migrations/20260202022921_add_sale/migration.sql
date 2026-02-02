-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "listingIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "amountTotalCents" INTEGER,
    "currency" TEXT,
    "buyerEmail" TEXT,
    "buyerName" TEXT,
    "buyerPhone" TEXT,
    "shippingLine1" TEXT,
    "shippingLine2" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingPostal" TEXT,
    "shippingCountry" TEXT,
    "receiptUrl" TEXT,
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sale_stripeSessionId_key" ON "Sale"("stripeSessionId");

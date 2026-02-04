
-- Update Quotes Table to make vat optional
ALTER TABLE "customers" ALTER COLUMN "vat" DROP NOT NULL;

-- Add showTotals column to quotes table
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "showTotals" boolean DEFAULT true;

-- Add adminSignature and adminSignatureScale columns to quotes table
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "adminSignature" text;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "adminSignatureScale" integer DEFAULT 100;

-- Update Customers Table to make address optional
ALTER TABLE "customers" ALTER COLUMN "address" DROP NOT NULL;

-- Add deletedAt column to quotes table for soft delete
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "deletedAt" timestamp with time zone;

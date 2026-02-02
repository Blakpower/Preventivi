
-- Update Quotes Table to make vat optional
ALTER TABLE "customers" ALTER COLUMN "vat" DROP NOT NULL;

-- Add showTotals column to quotes table
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "showTotals" boolean DEFAULT true;

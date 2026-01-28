-- Esegui questo script nel tuo pannello Supabase -> SQL Editor
-- per aggiungere le colonne mancanti alla tabella 'quotes'

ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "leasing" jsonb;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "attachmentsPosition" text;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "customerId" bigint REFERENCES "customers" ("id");

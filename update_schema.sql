-- Esegui questo script nell'editor SQL di Supabase per aggiornare la tabella settings

ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS "defaultHardwareScale" integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS "defaultSoftwareScale" integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS "defaultTargetScale" integer DEFAULT 100;

-- Aggiungi anche le colonne per le altezze se mancano (per sicurezza)
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS "defaultHardwareHeight" integer DEFAULT 380,
ADD COLUMN IF NOT EXISTS "defaultSoftwareHeight" integer DEFAULT 180,
ADD COLUMN IF NOT EXISTS "defaultTargetHeight" integer DEFAULT 180;

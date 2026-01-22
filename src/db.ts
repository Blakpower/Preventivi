import { supabase } from './lib/supabase';
export { supabase };

export interface User {
  id?: number;
  username: string;
  displayName: string;
  email?: string;
  passwordHash: string;
}

export interface Customer {
  id?: number;
  name: string;
  address: string;
  vat: string;
  email?: string;
  phone?: string;
  pec?: string;
  recipientCode?: string;
  ownerUserId?: number;
}

export interface Article {
  id?: number;
  code: string;
  description: string;
  unitPrice: number;
  unit: string;
  vat: number;
  ownerUserId?: number;
}

export interface QuoteItem {
  articleId?: number;
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
  total: number;
}

export interface QuoteAttachment {
  title: string;
  description: string;
  imageData?: string;
  layout?: {
    imagePosition?: 'top' | 'bottom' | 'left' | 'right';
    imageHeight?: number;
    descriptionFontSize?: number;
    descriptionColor?: string;
    showTitle?: boolean;
    fullPageImage?: boolean;
  };
}

export interface Quote {
  id?: number;
  number: string;
  date: Date;
  customerName: string;
  customerAddress: string;
  customerVat: string;
  items: QuoteItem[];
  attachments?: QuoteAttachment[];
  tocTextAbove?: string;
  tocText?: string;
  premessaText?: string;
  premessaHardwareImages?: string[];
  premessaHardwareImageHeight?: number;
  premessaHardwareImageCount?: number;
  softwareText?: string;
  softwareImages?: string[];
  softwareImageHeight?: number;
  softwareImageCount?: number;
  softwareImageScale?: number;
  targetAudienceImages?: string[];
  targetAudienceImageHeight?: number;
  targetAudienceImageCount?: number;
  targetAudienceImageScale?: number;
  descrizioneProdottiText?: string;
  descrizioneProdottiImages?: string[];
  descrizioneProdottiImageCount?: number;
  descrizioneProdottiImageFit?: 'contain' | 'cover';
  descrizioneProdottiFirstImageScale?: number;
  conditionsList?: string[];
  conditionsCount?: number;
  subtotal: number;
  vatTotal: number;
  total: number;
  notes: string;
  createdAt: Date;
  ownerUserId?: number;
  attachmentsPosition?: 'before' | 'after';
  customerId?: number;
}

export interface Settings {
  id?: number;
  userId: number;
  companyName: string;
  companyAddress: string;
  companyVat: string;
  companyEmail: string;
  companyPec?: string;
  companyPhone: string;
  companyRecipientCode?: string;
  bankInfo: string;
  logoUrl?: string;
  logoData?: string;
  defaultHardwareImage?: string;
  defaultSoftwareImage?: string;
  defaultTargetImage?: string;
  defaultDescrizioneImage?: string;
  defaultHardwareHeight?: number;
  defaultSoftwareHeight?: number;
  defaultTargetHeight?: number;
  defaultDescrizioneFirstHeight?: number;
  contractPagesText?: string;
  nextQuoteNumber: number;
  quoteNumberPrefix: string; // e.g., "2024-"
  defaultVat: number;
  attachmentsDefaults?: {
    position?: 'before' | 'after';
    layout?: {
      imagePosition?: 'top' | 'bottom' | 'left' | 'right';
      imageHeight?: number;
      descriptionFontSize?: number;
      descriptionColor?: string;
      showTitle?: boolean;
      fullPageImage?: boolean;
    };
  };
}

// Helper to get current user ID
const CURRENT_USER_KEY = 'currentUserId';
export function getCurrentUserId(): number | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  return raw ? Number(raw) : null;
}
export function setCurrentUserId(userId: number | null) {
  if (userId == null) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, String(userId));
  }
}

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const hash = await hashPassword(password);
  // Allow legacy plain storage by matching either exact or hashed
  return storedHash === hash || storedHash === password;
}

// Deprecated helpers for compatibility during refactor
export function ensureDbOpen() { return Promise.resolve(); }
export function logDexieError(context: string, error: unknown) {
  console.error(context, error);
}

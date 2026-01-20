import Dexie, { type Table } from 'dexie';

export interface Article {
  id?: number;
  code: string;
  description: string;
  unitPrice: number;
  unit: string;
  vat: number;
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
  subtotal: number;
  vatTotal: number;
  total: number;
  notes: string;
  createdAt: Date;
}

export interface Settings {
  id?: number;
  companyName: string;
  companyAddress: string;
  companyVat: string;
  companyEmail: string;
  companyPhone: string;
  bankInfo: string;
  logoUrl?: string;
  logoData?: string;
  contractPagesText?: string;
  nextQuoteNumber: number;
  quoteNumberPrefix: string; // e.g., "2024-"
  defaultVat: number;
}

export class MyDatabase extends Dexie {
  articles!: Table<Article>;
  quotes!: Table<Quote>;
  settings!: Table<Settings>;

  constructor() {
    super('PreventiviManager');
    this.version(1).stores({
      articles: '++id, code, description',
      quotes: '++id, number, date, customerName',
      settings: '++id'
    });
    this.version(2).stores({
      articles: '++id, code, description',
      quotes: '++id, number, date, customerName, createdAt',
      settings: '++id'
    });
  }
}

export const db = new MyDatabase();

// Initialize settings if empty
db.on('populate', () => {
  db.settings.add({
    companyName: 'La Mia Azienda',
    companyAddress: 'Via Roma 1, 00100 Roma',
    companyVat: '12345678901',
    companyEmail: 'info@azienda.it',
    companyPhone: '06 123456',
    bankInfo: 'IBAN: IT00 X 00000 00000 000000000000',
    nextQuoteNumber: 1,
    quoteNumberPrefix: new Date().getFullYear() + '-',
    defaultVat: 22
  });
});

export async function ensureDbOpen() {
  if (!db.isOpen()) {
    await db.open();
  }
}

export function logDexieError(context: string, error: unknown) {
  if (error instanceof Error) {
    console.error(context, error.name, error.message, error);
  } else {
    console.error(context, error);
  }
}

db.open().catch(async (error) => {
  console.error('IndexedDB open failed:', error);
  try {
    db.close();
    await Dexie.delete(db.name);
    await db.open();
    console.warn('IndexedDB reset and reopened');
  } catch (e) {
    console.error('IndexedDB recovery failed:', e);
  }
});

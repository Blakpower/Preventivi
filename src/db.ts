import Dexie, { type Table } from 'dexie';

export interface User {
  id?: number;
  username: string;
  displayName: string;
  email?: string;
  passwordHash: string;
}

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
  layout?: {
    imagePosition?: 'top' | 'bottom' | 'left' | 'right';
    imageHeight?: number;
    descriptionFontSize?: number;
    descriptionColor?: string;
    showTitle?: boolean;
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
  subtotal: number;
  vatTotal: number;
  total: number;
  notes: string;
  createdAt: Date;
  ownerUserId?: number;
}

export interface Settings {
  id?: number;
  userId: number;
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
  users!: Table<User>;
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
    this.version(3).stores({
      users: '++id, username',
      articles: '++id, code, description',
      quotes: '++id, number, date, customerName, createdAt, ownerUserId',
      settings: '++id, userId'
    }).upgrade(async (tx) => {
      const users = tx.table<User>('users');
      const quotes = tx.table<Quote>('quotes');
      const settings = tx.table<Settings>('settings');
      const existingUsers = await users.count();
      if (existingUsers === 0) {
        await users.add({
          username: 'admin',
          displayName: 'Admin',
          email: '',
          passwordHash: 'admin'
        });
      }
      const admin = await users.where('username').equals('admin').first();
      if (admin) {
        await quotes.toCollection().modify(q => {
          if (!q.ownerUserId) q.ownerUserId = admin.id!;
        });
        await settings.toCollection().modify(s => {
          if (!s.userId) s.userId = admin.id!;
        });
      }
    });
  }
}

export const db = new MyDatabase();

// Initialize settings if empty
db.on('populate', () => {
  db.users.add({
    username: 'admin',
    displayName: 'Admin',
    email: '',
    passwordHash: 'admin'
  }).then(async (id) => {
    await db.settings.add({
      userId: id!,
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

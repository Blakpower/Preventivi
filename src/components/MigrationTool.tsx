import React, { useState } from 'react';
import Dexie from 'dexie';
import { supabase, getCurrentUserId } from '../db';

export const MigrationTool: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to migrate');
  const [dbName, setDbName] = useState('PreventiviDB');
  const [isMigrating, setIsMigrating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const migrate = async () => {
    const customerIdMap: Record<number, number> = {};
    const uid = getCurrentUserId();
    if (!uid) {
      setStatus('Error: You must be logged in to migrate data.');
      return;
    }

    setIsMigrating(true);
    setStatus('Opening local database...');
    addLog(`Attempting to open Dexie DB: ${dbName}`);

    try {
      const db = new Dexie(dbName);
      // We don't define stores here to allow dynamic opening, but we need to know table names.
      // Dexie requires version/stores to be defined if we want to use the ORM features, 
      // but for dynamic access we can try to open it if it exists.
      // Actually, Dexie won't open a DB dynamically unless we match the schema or use `db.open()` on an existing DB.
      // If we don't know the version, it's tricky.
      // However, if we just want to read, we can declare the tables we expect.
      
      // Let's try to declare the schema we expect.
      db.version(1).stores({
        users: '++id, username',
        customers: '++id, name, vat',
        articles: '++id, code, description',
        quotes: '++id, number, date, customerId',
        settings: '++id'
      });

      await db.open();
      addLog('Local database opened successfully.');

      // Migrate Customers
      addLog('Migrating Customers...');
      const customers = await db.table('customers').toArray();
      addLog(`Found ${customers.length} customers.`);
      
      let customersMigrated = 0;
      for (const c of customers) {
        // Remove ID to let Supabase generate new ones, or keep it? 
        // Better to remove ID to avoid conflicts, unless we want to preserve history exactly.
        // But if we remove ID, we break relationships (quotes -> customerId).
        // We should try to keep ID if possible, or map old IDs to new IDs.
        // Since Supabase tables are likely empty or we are just appending, we can try to insert.
        // But if IDs clash, we have a problem.
        // Strategy: Insert and let Supabase handle IDs? No, we need to link Quotes.
        // Strategy: Insert Customer -> Get new ID -> Map Old ID to New ID -> Use in Quotes.
        
        // Actually, if the Supabase table is empty, we can maybe force IDs if we turn off identity insert?
        // Supabase/Postgres usually handles auto-increment.
        // Safer approach: Map IDs.
        
        const { id: oldId, ...rest } = c;
        const { data: newCustomer, error } = await supabase
          .from('customers')
          .insert({ ...rest, ownerUserId: uid })
          .select()
          .single();
          
        if (error) {
          addLog(`Error migrating customer ${c.name}: ${error.message}`);
        } else {
          // Store mapping?
          // We need a mapping for Quotes migration.
          // Let's store mapping in a temporary object.
          customerIdMap[oldId] = newCustomer.id;
          customersMigrated++;
        }
      }
      addLog(`Migrated ${customersMigrated} customers.`);

      // Migrate Articles
      addLog('Migrating Articles...');
      const articles = await db.table('articles').toArray();
      addLog(`Found ${articles.length} articles.`);
      let articlesMigrated = 0;
      for (const a of articles) {
        const { id: oldId, ...rest } = a;
        const { error } = await supabase
          .from('articles')
          .insert({ ...rest, ownerUserId: uid });
        
        if (error) {
            addLog(`Error migrating article ${a.code}: ${error.message}`);
        } else {
            articlesMigrated++;
        }
      }
      addLog(`Migrated ${articlesMigrated} articles.`);

      // Migrate Settings
      addLog('Migrating Settings...');
      const settings = await db.table('settings').toArray();
      if (settings.length > 0) {
        const s = settings[0];
        // Remove old ID and any local userId.
        // We will associate with the current logged-in Supabase user.
        const { id: oldId, userId, ...rest } = s;

        // Check if settings already exist for this user in Supabase
        const { data: existingSettings } = await supabase
          .from('settings')
          .select('id')
          .eq('userId', uid)
          .maybeSingle(); // Use maybeSingle to avoid error if 0 rows

        let error;
        if (existingSettings) {
          addLog('Updating existing settings in cloud...');
          const { error: updateError } = await supabase
            .from('settings')
            .update({ ...rest })
            .eq('id', existingSettings.id);
          error = updateError;
        } else {
          addLog('Inserting new settings to cloud...');
          const { error: insertError } = await supabase
            .from('settings')
            .insert({ ...rest, userId: uid });
          error = insertError;
        }
          
        if (error) addLog(`Error migrating settings: ${error.message}`);
        else addLog('Settings migrated successfully.');
      } else {
        addLog('No local settings found to migrate.');
      }

      // Migrate Quotes
      addLog('Migrating Quotes...');
      const quotes = await db.table('quotes').toArray();
      addLog(`Found ${quotes.length} quotes.`);
      let quotesMigrated = 0;
      for (const q of quotes) {
        const { id: oldId, customerId: oldCustomerId, ...rest } = q;
        
        // Map customerId
        const newCustomerId = customerIdMap[oldCustomerId];
        
        // If we didn't find a mapped customer, we might have an issue. 
        // We can leave it null or try to keep old ID if we assume sync?
        // Best to use newCustomerId if available, else keep old (and risk invalid reference) or null.
        
        const quoteToInsert = {
            ...rest,
            ownerUserId: uid,
            customerId: newCustomerId || null // or oldCustomerId if we want to risk it?
        };

        const { error } = await supabase
          .from('quotes')
          .insert(quoteToInsert);
          
        if (error) {
            addLog(`Error migrating quote ${q.number}: ${error.message}`);
        } else {
            quotesMigrated++;
        }
      }
      addLog(`Migrated ${quotesMigrated} quotes.`);

      setStatus('Migration completed!');
      
    } catch (err: any) {
      console.error(err);
      setStatus(`Migration failed: ${err.message}`);
      addLog(`Error: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Migrazione Dati Locale &rarr; Cloud</h2>
      <p className="text-slate-600 mb-4">
        Usa questo strumento per importare i dati salvati localmente (su questo dispositivo) nel database cloud.
        Questo renderà i tuoi preventivi visibili su tutti i dispositivi.
      </p>
      
      <div className="flex gap-4 mb-4">
        <input 
            type="text" 
            value={dbName} 
            onChange={(e) => setDbName(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2"
            placeholder="Nome Database (es. PreventiviDB)"
        />
        <button
            onClick={migrate}
            disabled={isMigrating}
            className={`px-4 py-2 rounded text-white font-medium ${isMigrating ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
            {isMigrating ? 'Migrazione in corso...' : 'Avvia Migrazione'}
        </button>
      </div>

      <div className="text-sm font-mono bg-slate-50 p-4 rounded border border-slate-200 h-48 overflow-y-auto">
        <div className="mb-2 font-bold text-slate-700">{status}</div>
        {logs.map((log, i) => (
          <div key={i} className="text-slate-600">{log}</div>
        ))}
      </div>
    </div>
  );
};

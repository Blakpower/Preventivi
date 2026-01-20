import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db, type Quote, ensureDbOpen, logDexieError } from '../db';
import { Plus, Search, Trash2, Download, FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { pdf } from '@react-pdf/renderer';
import { QuotePDF } from '../components/QuotePDF';

export const Quotes: React.FC = () => {
  const [search, setSearch] = useState('');
  const settings = useLiveQuery(async () => {
    try {
      await ensureDbOpen();
      const rows = await db.settings.toArray();
      return rows[0];
    } catch (error) {
      logDexieError('Dexie settings query failed:', error);
      return undefined;
    }
  });

  const quotes = useLiveQuery(async () => {
    try {
      await ensureDbOpen();
      const collection = db.quotes.orderBy('createdAt').reverse();
    
      if (search) {
        return await collection
          .filter(q => 
            q.customerName.toLowerCase().includes(search.toLowerCase()) || 
            q.number.toLowerCase().includes(search.toLowerCase())
          )
          .toArray();
      }
      return await collection.toArray();
    } catch (error) {
      logDexieError('Dexie quotes query failed:', error);
      return [];
    }
  }, [search]);

  const handleDelete = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questo preventivo?')) {
      await db.quotes.delete(id);
    }
  };

  const handleDownloadPDF = async (quote: Quote) => {
    if (!settings) {
      alert('Impostazioni non caricate');
      return;
    }
    try {
      const blob = await pdf(<QuotePDF quote={quote} settings={settings} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Preventivo_${quote.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Errore nella generazione del PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Preventivi</h1>
          <p className="text-slate-500 mt-1">Gestisci e monitora tutti i tuoi preventivi emessi.</p>
        </div>
        <Link
          to="/quotes/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus size={20} />
          <span className="font-medium">Nuovo Preventivo</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cerca per cliente o numero..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            {quotes?.length || 0} Preventivi
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Numero</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Totale</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes?.map((quote) => (
                <tr key={quote.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3">
                        <FileText size={16} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">#{quote.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2 text-slate-400" />
                      {format(quote.date, 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User size={14} className="mr-2 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{quote.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">
                        € {quote.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDownloadPDF(quote)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Scarica PDF"
                      >
                        <Download size={16} />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => quote.id && handleDelete(quote.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Elimina"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {quotes?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium text-slate-500">Nessun preventivo trovato</p>
                      <p className="text-sm text-slate-400 mt-1">Inizia creando il tuo primo preventivo.</p>
                      <Link
                        to="/quotes/new"
                        className="mt-4 text-blue-600 font-medium hover:underline"
                      >
                        Nuovo Preventivo
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Quote, getCurrentUserId } from '../db';
import { ArrowLeft, RefreshCw, Trash2, FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export const Trash: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeletedQuotes = async () => {
      const uid = getCurrentUserId();
      if (!uid) return;
      
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('id, number, date, customerName, total, createdAt, deletedAt')
          .eq('ownerUserId', uid)
          .not('deletedAt', 'is', null)
          .order('deletedAt', { ascending: false });
        
        if (error) {
          console.error('Error fetching deleted quotes:', error);
        } else if (data) {
          const typedQuotes = data.map((q: any) => ({
            ...q,
            date: new Date(q.date),
            deletedAt: new Date(q.deletedAt)
          }));
          setQuotes(typedQuotes);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeletedQuotes();
  }, []);

  const handleRestore = async (id: number) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ deletedAt: null })
        .eq('id', id);

      if (error) throw error;
      setQuotes(quotes.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error restoring quote:', error);
      alert('Errore durante il ripristino');
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (confirm('ATTENZIONE: Questa azione è irreversibile. Vuoi cancellare definitivamente questo preventivo?')) {
      try {
        const { error } = await supabase
          .from('quotes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setQuotes(quotes.filter(q => q.id !== id));
      } catch (error) {
        console.error('Error deleting quote:', error);
        alert('Errore durante l\'eliminazione definitiva');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/quotes" 
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Cestino</h1>
            <p className="text-slate-500 mt-1">Recupera o elimina definitivamente i preventivi. I preventivi nel cestino da più di 30 giorni verranno eliminati automaticamente.</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Caricamento...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Numero</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Eliminazione</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Totale</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mr-3">
                          <FileText size={16} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">#{quote.number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User size={14} className="mr-2 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{quote.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2 text-slate-400" />
                        {quote.deletedAt && format(quote.deletedAt, 'dd MMM yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">
                        € {quote.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => quote.id && handleRestore(quote.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          title="Ripristina"
                        >
                          <RefreshCw size={16} />
                          <span>Ripristina</span>
                        </button>
                        <button
                          onClick={() => quote.id && handlePermanentDelete(quote.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Elimina Definitivamente"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Trash2 size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-500">Il cestino è vuoto</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

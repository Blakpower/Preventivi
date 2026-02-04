import React, { useEffect, useState } from 'react';
import { supabase, type Quote, getCurrentUserId } from '../db';
import { FileText, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    quotesCount: 0,
    recentQuotes: [] as Quote[]
  });

  useEffect(() => {
    const controller = new AbortController();
    const fetchStats = async () => {
      const uid = getCurrentUserId();
      if (!uid) return;

      // Fetch quotes for stats and recent list
      
      const { count: qCount, error: qError } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('ownerUserId', uid)
        .abortSignal(controller.signal);

      const { data: recentQuotesData, error: recentError } = await supabase
        .from('quotes')
        .select('id, number, customerName, date, total, createdAt, ownerUserId')
        .eq('ownerUserId', uid)
        .order('createdAt', { ascending: false })
        .limit(5)
        .abortSignal(controller.signal);

      const recentQuotes = (recentQuotesData || []).map((q: any) => ({
        ...q,
        date: new Date(q.date),
        createdAt: new Date(q.createdAt)
      }));

      const isAbortError = (err: any) => err?.name === 'AbortError' || String(err?.message).includes('Abort');

      if (qError && !isAbortError(qError)) console.error(qError);
      if (recentError && !isAbortError(recentError)) console.error(recentError);

      if (!controller.signal.aborted) {
        setStats({
          quotesCount: qCount || 0,
          recentQuotes
        });
      }
    };
    
    fetchStats().catch(e => {
      if (e?.name !== 'AbortError' && !String(e?.message).includes('Abort')) {
        console.error('Error in Dashboard fetch:', e);
      }
    });
    
    return () => controller.abort();
  }, []);

  if (!stats) return <div className="p-8 text-center text-slate-500">Caricamento dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bentornato, Admin</h1>
        <p className="text-slate-500 mt-1">Ecco cosa succede oggi nella tua attività.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <FileText size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight size={14} className="mr-1" /> +12%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Totale Preventivi</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.quotesCount}</h3>
          </div>
        </div>

        <Link
          to="/quotes/new"
          className="bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-xl hover:scale-[1.02] transition-all p-6 flex flex-col items-center justify-center text-white group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 bg-white/20 rounded-full mb-3 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
              <Plus size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-1">Nuovo Preventivo</h3>
            <p className="text-blue-100 font-medium">Crea un nuovo documento</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Quotes List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Preventivi Recenti</h3>
            <Link to="/quotes" className="text-sm text-blue-600 font-medium hover:text-blue-700">Vedi tutti</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Totale</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {stats.recentQuotes?.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs mr-3">
                          {quote.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{quote.customerName}</p>
                          <p className="text-xs text-slate-500">#{quote.number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(quote.date, 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                        € {quote.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link 
                        to={`/quotes/${quote.id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Vedi
                      </Link>
                    </td>
                  </tr>
                ))}
                {stats.recentQuotes?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Nessun preventivo recente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg text-white p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Potenzia il tuo Business</h3>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              Hai aggiunto tutti i tuoi articoli? Un database completo ti permette di creare preventivi in pochi secondi.
            </p>
            <Link 
              to="/articles"
              className="inline-block bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              Gestisci Articoli
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
        </div>
      </div>
    </div>
  );
};

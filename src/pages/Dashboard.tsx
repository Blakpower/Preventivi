import React, { useEffect, useState } from 'react';
import { supabase, type Quote, getCurrentUserId } from '../db';
import { FileText, Database, TrendingUp, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    quotesCount: 0,
    articlesCount: 0,
    totalValue: 0,
    recentQuotes: [] as Quote[]
  });

  useEffect(() => {
    const controller = new AbortController();
    const fetchStats = async () => {
      const uid = getCurrentUserId();
      if (!uid) return;

      // Fetch quotes for stats and recent list
      // We'll fetch all totals for sum, but only full details for recent 5
      // Optimally:
      // 1. Count and Sum: Fetch all 'total'
      // 2. Recent: Fetch top 5
      
      const { data: allQuotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('total, createdAt')
        .eq('ownerUserId', uid)
        .abortSignal(controller.signal);

      const quotesCount = allQuotesData?.length || 0;
      const totalValue = allQuotesData?.reduce((acc, q) => acc + (q.total || 0), 0) || 0;

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

      // Fetch articles count
      const { count: articlesCount, error: articlesError } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('ownerUserId', uid)
        .abortSignal(controller.signal);

      const isAbortError = (err: any) => err?.name === 'AbortError' || String(err?.message).includes('Abort');

      if (quotesError && !isAbortError(quotesError)) console.error(quotesError);
      if (recentError && !isAbortError(recentError)) console.error(recentError);
      if (articlesError && !isAbortError(articlesError)) console.error(articlesError);

      if (!controller.signal.aborted) {
        setStats({
          quotesCount,
          articlesCount: articlesCount || 0,
          totalValue,
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bentornato, Admin</h1>
          <p className="text-slate-500 mt-1">Ecco cosa succede oggi nella tua attività.</p>
        </div>
        <Link 
          to="/quotes/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center space-x-2 font-medium"
        >
          <Plus size={20} />
          <span>Nuovo Preventivo</span>
        </Link>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight size={14} className="mr-1" /> +5%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Fatturato Potenziale</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">€ {stats.totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
              <Database size={24} />
            </div>
            <span className="text-xs font-medium text-slate-400">Database</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Articoli in Catalogo</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.articlesCount}</h3>
          </div>
        </div>
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Importo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      € {quote.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Emesso
                      </span>
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

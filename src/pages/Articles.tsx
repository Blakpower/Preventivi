import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Article, ensureDbOpen, logDexieError } from '../db';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { ArticleForm } from '../components/ArticleForm';

export const Articles: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>(undefined);
  const [search, setSearch] = useState('');

  const articles = useLiveQuery(async () => {
    try {
      await ensureDbOpen();
      if (search) {
        return await db.articles
          .filter(a => 
            a.code.toLowerCase().includes(search.toLowerCase()) || 
            a.description.toLowerCase().includes(search.toLowerCase())
          )
          .toArray();
      }
      return await db.articles.toArray();
    } catch (error) {
      logDexieError('Dexie articles query failed:', error);
      return [];
    }
  }, [search]);

  const handleSubmit = async (data: Omit<Article, 'id'>) => {
    if (editingArticle && editingArticle.id) {
      await db.articles.update(editingArticle.id, data);
    } else {
      await db.articles.add(data as Article);
    }
    setIsFormOpen(false);
    setEditingArticle(undefined);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questo articolo?')) {
      await db.articles.delete(id);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setEditingArticle(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Catalogo Articoli</h1>
          <p className="text-slate-500 mt-1">Gestisci i prodotti e servizi da inserire nei preventivi.</p>
        </div>
        <button
          onClick={handleNew}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus size={20} />
          <span className="font-medium">Nuovo Articolo</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cerca per codice o descrizione..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            {articles?.length || 0} Articoli
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Codice</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrizione</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prezzo Unitario</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">IVA</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles?.map((article) => (
                <tr key={article.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                        <Package size={16} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{article.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 line-clamp-1">{article.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-sm font-bold text-slate-900">€ {article.unitPrice.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                      <span className="text-xs text-slate-400">/ {article.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                      {article.vat}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(article)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifica"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => article.id && handleDelete(article.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Elimina"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {articles?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Package size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium text-slate-500">Nessun articolo trovato</p>
                      <p className="text-sm text-slate-400 mt-1">Inizia aggiungendo un nuovo articolo al tuo catalogo.</p>
                      <button
                        onClick={handleNew}
                        className="mt-4 text-blue-600 font-medium hover:underline"
                      >
                        Crea articolo
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <ArticleForm
          initialData={editingArticle}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

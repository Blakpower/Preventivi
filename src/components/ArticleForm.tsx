import React from 'react';
import { useForm } from 'react-hook-form';
import { type Article } from '../db';
import { X } from 'lucide-react';

interface ArticleFormProps {
  initialData?: Article;
  onSubmit: (data: Omit<Article, 'id'>) => void;
  onCancel: () => void;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Article>({
    defaultValues: initialData || {
      code: '',
      description: '',
      unitPrice: 0,
      unit: 'pz',
      vat: 22
    }
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Modifica Articolo' : 'Nuovo Articolo'}</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Codice</label>
            <input
              {...register('code', { required: 'Il codice è obbligatorio' })}
              className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
              placeholder="Es. ART-001"
            />
            {errors.code && <p className="text-red-500 text-xs mt-1 font-medium">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Descrizione</label>
            <textarea
              {...register('description', { required: 'La descrizione è obbligatoria' })}
              className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
              rows={3}
              placeholder="Descrizione dettagliata dell'articolo..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Prezzo Unitario (€)</label>
              <input
                type="number"
                step="0.01"
                {...register('unitPrice', { required: true, valueAsNumber: true })}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Unità di Misura</label>
              <input
                {...register('unit', { required: true })}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="pz, kg, h..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">IVA (%)</label>
            <input
              type="number"
              {...register('vat', { required: true, valueAsNumber: true })}
              className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95"
            >
              Salva Articolo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

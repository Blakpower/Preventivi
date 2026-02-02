import React, { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { Quote } from '../db';
import { Coins, Calendar } from 'lucide-react';

interface Props {
  form: UseFormReturn<Quote>;
}

export const LeasingForm: React.FC<Props> = ({ form }) => {
  const { register, watch, setValue, getValues } = form;

  const assetValue = watch('leasing.assetValue');
  const vatRate = watch('leasing.vatRate');

  // Set default VAT rate to 22% on mount if not set
  useEffect(() => {
    const currentVat = getValues('leasing.vatRate');
    if (currentVat === undefined || currentVat === null) {
      setValue('leasing.vatRate', 22);
    }
  }, [setValue, getValues]);

  // Auto-calculate VAT amount and Total
  useEffect(() => {
    const val = Number(assetValue);
    const rate = Number(vatRate);
    
    if (!isNaN(val) && !isNaN(rate)) {
      const vat = (val * rate) / 100;
      const total = val + vat;
      setValue('leasing.vatAmount', Number(vat.toFixed(2)));
      setValue('leasing.totalAssetValueVatIncl', Number(total.toFixed(2)));
    }
  }, [assetValue, vatRate, setValue]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
          <Coins size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Dati Leasing</h2>
      </div>

      <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <label className="block text-sm font-bold text-slate-700 mb-3">Tipo Piano</label>
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="radio"
              value="leasing"
              {...register('leasing.type')}
              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 transition-all"
            />
            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Leasing</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="radio"
              value="financing"
              {...register('leasing.type')}
              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 transition-all"
            />
            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Finanziamento</span>
          </label>
        </div>
      </div>

      <div className="space-y-8">
        {/* 1) Parametri economici base */}
        <div>
          <h3 className="flex items-center text-sm font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded">
            <Coins className="w-4 h-4 mr-2 text-blue-500" />
            1. Parametri Economici Base
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Importo bene / Imponibile</label>
              <input type="number" step="0.01" {...register('leasing.assetValue', { valueAsNumber: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Aliquota IVA (%)</label>
              <input type="number" step="0.01" {...register('leasing.vatRate', { valueAsNumber: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Importo IVA</label>
              <input type="number" step="0.01" {...register('leasing.vatAmount', { valueAsNumber: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Totale bene IVA inclusa</label>
              <input type="number" step="0.01" {...register('leasing.totalAssetValueVatIncl', { valueAsNumber: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Anticipo / Maxicanone (€)</label>
              <input type="number" step="0.01" {...register('leasing.initialDownPaymentValue', { valueAsNumber: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Anticipo (%)</label>
              <input type="number" step="0.01" {...register('leasing.initialDownPaymentPercent', { valueAsNumber: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Capitale finanziato netto</label>
              <input type="number" step="0.01" {...register('leasing.netFinancedCapital', { valueAsNumber: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
          </div>
        </div>

        {/* 2) Durata e struttura canoni */}
        <div>
          <h3 className="flex items-center text-sm font-bold text-slate-800 mb-4 bg-slate-50 p-2 rounded">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            2. Durata e Struttura Canoni
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Durata (mesi)</label>
              <input type="number" {...register('leasing.durationMonths', { valueAsNumber: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Numero canoni</label>
              <input type="number" {...register('leasing.numberOfInstallments', { valueAsNumber: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Periodicità</label>
              <select {...register('leasing.periodicity')} className="block w-full rounded-lg border-slate-200 text-sm">
                <option value="monthly">Mensile</option>
                <option value="quarterly">Trimestrale</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Importo Canone</label>
              <input type="number" step="0.01" {...register('leasing.installmentAmount', { valueAsNumber: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Data decorrenza</label>
              <input type="date" {...register('leasing.startDate', { valueAsDate: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Data 1° canone</label>
              <input type="date" {...register('leasing.firstInstallmentDate', { valueAsDate: true })} className="block w-full rounded-lg border-slate-200 text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

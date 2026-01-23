import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { Quote } from '../db';
import { Coins, Calendar } from 'lucide-react';

interface Props {
  form: UseFormReturn<Quote>;
}

export const LeasingForm: React.FC<Props> = ({ form }) => {
  const { register } = form;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
          <Coins size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Dati Leasing</h2>
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

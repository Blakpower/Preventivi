import React from 'react';
import { useForm } from 'react-hook-form';
import { type Customer } from '../db';
import { X } from 'lucide-react';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: Omit<Customer, 'id'>) => void;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Customer>({
    defaultValues: initialData || {
      name: '',
      address: '',
      vat: '',
      email: '',
      phone: '',
      pec: '',
      recipientCode: ''
    }
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Modifica Cliente' : 'Nuovo Cliente'}</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ragione Sociale / Nome</label>
              <input
                {...register('name', { required: 'La ragione sociale è obbligatoria' })}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="Es. Mario Rossi S.r.l."
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Indirizzo Completo</label>
              <input
                {...register('address', { required: 'L\'indirizzo è obbligatorio' })}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="Via Roma 1, 00100 Roma (RM)"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">P.IVA / Codice Fiscale</label>
              <input
                {...register('vat', { required: 'La P.IVA o il Codice Fiscale sono obbligatori' })}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="IT12345678901"
              />
              {errors.vat && <p className="text-red-500 text-xs mt-1 font-medium">{errors.vat.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                {...register('email')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="email@cliente.it"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Telefono</label>
              <input
                {...register('phone')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="+39 333 1234567"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">PEC</label>
              <input
                type="email"
                {...register('pec')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="pec@pec.it"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Codice Destinatario</label>
              <input
                {...register('recipientCode')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="0000000"
                maxLength={7}
              />
            </div>
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
              Salva Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

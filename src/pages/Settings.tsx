import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Settings, ensureDbOpen, logDexieError, getCurrentUserId } from '../db';
import { Save, Building2, FileText, Wallet } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const settings = useLiveQuery(async () => {
    try {
      await ensureDbOpen();
      const uid = getCurrentUserId();
      if (!uid) return undefined;
      const row = await db.settings.where('userId').equals(uid).first();
      return row;
    } catch (error) {
      logDexieError('Dexie settings query failed:', error);
      return undefined;
    }
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { isDirty } } = useForm<Settings>();

  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onLogoFileChange = async (file?: File) => {
    if (!file) return;
    const dataUrl = await toBase64(file);
    setValue('logoData', dataUrl, { shouldDirty: true });
  };

  const onSubmit = async (data: Settings) => {
    try {
      const uid = getCurrentUserId();
      if (!uid) return;
      if (settings && settings.id) {
        await db.settings.update(settings.id, { ...data, userId: uid });
        alert('Impostazioni salvate con successo!');
      } else {
        await db.settings.add({ ...data, userId: uid });
        alert('Impostazioni create con successo!');
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Errore durante il salvataggio.");
    }
  };

  if (!settings) return <div className="p-8 text-center text-slate-500">Caricamento impostazioni...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Impostazioni</h1>
          <p className="text-slate-500 mt-1">Gestisci i dati aziendali e le preferenze dell'applicazione.</p>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty}
          className={`px-6 py-3 rounded-xl flex items-center space-x-2 font-semibold shadow-lg transition-all active:scale-95 ${
            isDirty 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Save size={20} />
          <span>Salva Modifiche</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Company Info Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <Building2 size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Dati Azienda</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ragione Sociale</label>
              <input
                {...register('companyName')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="La tua Azienda SRL"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Indirizzo Completo</label>
              <input
                {...register('companyAddress')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="Via Roma 1, 00100 Roma (RM)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Logo Aziendale (file)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onLogoFileChange(e.target.files?.[0])}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
              />
              <input type="hidden" {...register('logoData')} />
              {watch('logoData') && (
                <div className="mt-3">
                  <img
                    src={watch('logoData')}
                    alt="Logo anteprima"
                    className="h-14 object-contain bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Carica il logo dal tuo PC. Verrà mostrato in alto a destra nel PDF.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">P.IVA / Codice Fiscale</label>
              <input
                {...register('companyVat')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Aziendale</label>
              <input
                type="email"
                {...register('companyEmail')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">PEC</label>
              <input
                type="email"
                {...register('companyPec')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="es. azienda@pec.it"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Telefono</label>
              <input
                type="tel"
                {...register('companyPhone')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Codice destinatario (SDI)</label>
              <input
                {...register('companyRecipientCode')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="es. 0000000 o univoco SDI"
              />
            </div>
          </div>
        </div>

        {/* Banking & Financial Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
              <Wallet size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Dati Bancari</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Coordinate Bancarie (IBAN, Banca)</label>
              <textarea
                {...register('bankInfo')}
                rows={3}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="IT00 X000 0000 0000..."
              />
              <p className="text-xs text-slate-500 mt-1">Queste informazioni appariranno nel footer del preventivo.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Pagine Contrattuali (separa le pagine con ---)</label>
              <textarea
                {...register('contractPagesText')}
                rows={6}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder={"Titolo contratto...\nTermini e condizioni...\n---\nAltra pagina..."}
              />
              <p className="text-xs text-slate-500 mt-1">Ogni '---' separa una nuova pagina nel PDF.</p>
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Configurazione Documenti</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Prefisso Preventivi</label>
              <input
                {...register('quoteNumberPrefix')}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                placeholder="PREV-"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Prossimo Numero</label>
              <input
                type="number"
                {...register('nextQuoteNumber', { valueAsNumber: true })}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">IVA Default (%)</label>
              <input
                type="number"
                {...register('defaultVat', { valueAsNumber: true })}
                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

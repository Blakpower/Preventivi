import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase, type Settings, getCurrentUserId } from '../db';
import { Save, Building2, FileText, Wallet } from 'lucide-react';
import { MigrationTool } from '../components/MigrationTool';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const uid = getCurrentUserId();
        if (!uid) return;
        const { data } = await supabase
          .from('settings')
          .select('*')
          .eq('userId', uid)
          .single();
        
        if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

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
  const onDefaultHardwareChange = async (file?: File) => {
    if (!file) return;
    const dataUrl = await toBase64(file);
    setValue('defaultHardwareImage', dataUrl, { shouldDirty: true });
  };
  const onDefaultSoftwareChange = async (file?: File) => {
    if (!file) return;
    const dataUrl = await toBase64(file);
    setValue('defaultSoftwareImage', dataUrl, { shouldDirty: true });
  };
  const onDefaultTargetChange = async (file?: File) => {
    if (!file) return;
    const dataUrl = await toBase64(file);
    setValue('defaultTargetImage', dataUrl, { shouldDirty: true });
  };

  const onSubmit = async (data: Settings) => {
    try {
      const uid = getCurrentUserId();
      if (!uid) return;
      
      const payload = { ...data, userId: uid };
      // Remove undefined fields
      Object.keys(payload).forEach(key => payload[key as keyof Settings] === undefined && delete payload[key as keyof Settings]);

      if (settings?.id) {
        const { error } = await supabase.from('settings').update(payload).eq('id', settings.id);
        if (error) throw error;
        alert('Impostazioni salvate con successo!');
      } else {
        const { error } = await supabase.from('settings').insert(payload);
        if (error) throw error;
        alert('Impostazioni create con successo!');
      }
      
      // Refresh
      const { data: newData } = await supabase.from('settings').select('*').eq('userId', uid).single();
      if (newData) {
        setSettings(newData);
        reset(newData);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Errore durante il salvataggio.");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Caricamento impostazioni...</div>;
  if (!settings && !getCurrentUserId()) return <div className="p-8 text-center text-slate-500">Effettua il login per vedere le impostazioni.</div>;

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
          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Immagini di default per i preventivi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Hardware (immagine default)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onDefaultHardwareChange(e.target.files?.[0])}
                  className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                />
                <input type="hidden" {...register('defaultHardwareImage')} />
                {watch('defaultHardwareImage') && (
                  <img src={watch('defaultHardwareImage')} alt="Hardware default" className="mt-2 h-24 object-contain border rounded-lg" />
                )}
                <div className="mt-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Scala Hardware (%)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={30}
                      max={200}
                      step={5}
                      {...register('defaultHardwareScale', { valueAsNumber: true })}
                      className="w-full"
                    />
                    <span className="text-sm text-slate-600">{watch('defaultHardwareScale') || 100}%</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Software (immagine default)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onDefaultSoftwareChange(e.target.files?.[0])}
                  className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                />
                <input type="hidden" {...register('defaultSoftwareImage')} />
                {watch('defaultSoftwareImage') && (
                  <img src={watch('defaultSoftwareImage')} alt="Software default" className="mt-2 h-24 object-contain border rounded-lg" />
                )}
                <div className="mt-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Scala Software (%)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={30}
                      max={200}
                      step={5}
                      {...register('defaultSoftwareScale', { valueAsNumber: true })}
                      className="w-full"
                    />
                    <span className="text-sm text-slate-600">{watch('defaultSoftwareScale') || 100}%</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">A chi ci rivolgiamo (immagine default)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onDefaultTargetChange(e.target.files?.[0])}
                  className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                />
                <input type="hidden" {...register('defaultTargetImage')} />
                {watch('defaultTargetImage') && (
                  <img src={watch('defaultTargetImage')} alt="Target default" className="mt-2 h-24 object-contain border rounded-lg" />
                )}
                <div className="mt-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Scala Target (%)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={30}
                      max={200}
                      step={5}
                      {...register('defaultTargetScale', { valueAsNumber: true })}
                      className="w-full"
                    />
                    <span className="text-sm text-slate-600">{watch('defaultTargetScale') || 100}%</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Queste immagini saranno pre-caricate automaticamente nei nuovi preventivi.</p>
          </div>
          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Dimensioni immagini PDF (px)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Altezza Hardware</label>
                <input
                  type="number"
                  {...register('defaultHardwareHeight', { valueAsNumber: true })}
                  className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                  placeholder="380"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Altezza Software</label>
                <input
                  type="number"
                  {...register('defaultSoftwareHeight', { valueAsNumber: true })}
                  className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                  placeholder="180"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Altezza A chi ci rivolgiamo</label>
                <input
                  type="number"
                  {...register('defaultTargetHeight', { valueAsNumber: true })}
                  className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                  placeholder="180"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
      
      <MigrationTool />
    </div>
  );
};

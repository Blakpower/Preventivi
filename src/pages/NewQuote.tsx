import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Quote, ensureDbOpen, logDexieError, getCurrentUserId } from '../db';
import { Plus, Trash2, Save, ArrowLeft, Calculator, User, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { PDFViewer } from '@react-pdf/renderer';
import { QuotePDF } from '../components/QuotePDF';

export const NewQuote: React.FC = () => {
  const navigate = useNavigate();
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
  const articles = useLiveQuery(async () => {
    try {
      await ensureDbOpen();
      return await db.articles.toArray();
    } catch (error) {
      logDexieError('Dexie articles query failed:', error);
      return [];
    }
  });

  const { register, control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<Quote>({
    defaultValues: {
      date: new Date(),
      items: [],
      attachments: [],
      attachmentsPosition: 'after',
      tocText: '',
      premessaText: '',
      premessaHardwareImages: [],
      softwareText: '',
      softwareImages: [],
      targetAudienceImages: [],
      subtotal: 0,
      vatTotal: 0,
      total: 0,
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });
  const { fields: attachFields, append: attachAppend, remove: attachRemove, move: attachMove } = useFieldArray({
    control,
    name: 'attachments'
  });

  // Watch items to calculate totals (handled via recalcTotals in change handlers)

  useEffect(() => {
    if (settings && !getValues('number')) {
      setValue('number', `${settings.quoteNumberPrefix}${settings.nextQuoteNumber}`);
      if (settings.attachmentsDefaults?.position) {
        setValue('attachmentsPosition', settings.attachmentsDefaults.position);
      }
    }
  }, [settings, setValue, getValues]);

  const recalcTotals = () => {
    const currentItems = getValues('items') || [];
    const subtotal = currentItems.reduce((acc, item) => acc + (item?.total || 0), 0);
    const vatTotal = currentItems.reduce((acc, item) => {
      const lineTotal = item?.total || 0;
      const lineVat = item?.vat || 0;
      return acc + (lineTotal * lineVat / 100);
    }, 0);
    const total = subtotal + vatTotal;
    setValue('subtotal', subtotal);
    setValue('vatTotal', vatTotal);
    setValue('total', total);
  };

  const onArticleSelect = (index: number, articleId: string) => {
    const article = articles?.find(a => a.id === Number(articleId));
    if (article) {
      setValue(`items.${index}.articleId`, article.id);
      setValue(`items.${index}.code`, article.code);
      setValue(`items.${index}.description`, article.description);
      setValue(`items.${index}.unitPrice`, article.unitPrice);
      setValue(`items.${index}.vat`, article.vat);
      setValue(`items.${index}.quantity`, 1);
      // Trigger calculation
      const total = 1 * article.unitPrice;
      setValue(`items.${index}.total`, total);
      recalcTotals();
    }
  };

  const onItemChange = (index: number) => {
    const qty = getValues(`items.${index}.quantity`) || 0;
    const price = getValues(`items.${index}.unitPrice`) || 0;
    setValue(`items.${index}.total`, qty * price);
    recalcTotals();
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onAttachmentFileChange = async (index: number, file?: File) => {
    if (!file) return;
    const dataUrl = await toBase64(file);
    setValue(`attachments.${index}.imageData`, dataUrl, { shouldDirty: true });
  };
  const onHardwareImageChange = async (idx: number, file?: File) => {
    if (!file) return;
    const dataUrl = await toBase64(file);
    const arr = getValues('premessaHardwareImages') || [];
    arr[idx] = dataUrl;
    setValue('premessaHardwareImages', arr, { shouldDirty: true });
  };
  const onSoftwareImageChange = async (idx: number, file?: File) => {
    if (!file) return;
    const dataUrl = await toBase64(file);
    const arr = getValues('softwareImages') || [];
    arr[idx] = dataUrl;
    setValue('softwareImages', arr, { shouldDirty: true });
  };
  const onTargetAudienceImageChange = async (idx: number, file?: File) => {
    if (!file) return;
    const dataUrl = await toBase64(file);
    const arr = getValues('targetAudienceImages') || [];
    arr[idx] = dataUrl;
    setValue('targetAudienceImages', arr, { shouldDirty: true });
  };

  useEffect(() => {
    (async () => {
      try {
        await ensureDbOpen();
        const uid = getCurrentUserId();
        if (!uid) return;
        const arr = await db.quotes.where('ownerUserId').equals(uid).toArray();
        const last = arr.sort((a, b) => {
          const av = a.createdAt ? new Date(a.createdAt).valueOf() : 0;
          const bv = b.createdAt ? new Date(b.createdAt).valueOf() : 0;
          return av - bv;
        }).pop();
        if (!last) return;
        if (last.premessaText) setValue('premessaText', last.premessaText);
        if (last.premessaHardwareImages) setValue('premessaHardwareImages', last.premessaHardwareImages);
        if (last.premessaHardwareImageHeight) setValue('premessaHardwareImageHeight', last.premessaHardwareImageHeight);
        if (last.softwareText) setValue('softwareText', last.softwareText);
        if (last.softwareImages) setValue('softwareImages', last.softwareImages);
        if (last.softwareImageHeight) setValue('softwareImageHeight', last.softwareImageHeight);
        if (last.targetAudienceImages) setValue('targetAudienceImages', last.targetAudienceImages);
        if (last.targetAudienceImageHeight) setValue('targetAudienceImageHeight', last.targetAudienceImageHeight);
        if (last.descrizioneProdottiText) setValue('descrizioneProdottiText', last.descrizioneProdottiText);
      } catch (e) {
        logDexieError('Load last quote defaults failed', e);
      }
    })();
  }, [setValue]);

  const onSubmit = async (data: Quote) => {
    try {
      if (!settings) return;

      const numberValue = data.number && String(data.number).trim() ? data.number : `${settings.quoteNumberPrefix}${settings.nextQuoteNumber}`;
      await db.quotes.add({
        ...data,
        number: numberValue,
        ownerUserId: getCurrentUserId() || undefined,
        createdAt: new Date()
      });

      // Update next quote number
      await db.settings.update(settings.id!, {
        nextQuoteNumber: settings.nextQuoteNumber + 1,
        attachmentsDefaults: {
          position: data.attachmentsPosition,
          layout: data.attachments && data.attachments[0]?.layout ? data.attachments[0]?.layout : settings.attachmentsDefaults?.layout
        }
      });

      navigate('/quotes');
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Errore durante il salvataggio del preventivo');
    }
  };

  if (!settings) return <div className="p-8 text-center text-slate-500">Caricamento impostazioni...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nuovo Preventivo</h1>
            <p className="text-slate-500 mt-1">Compila i dati per creare un nuovo documento.</p>
          </div>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 font-semibold"
        >
          <Save size={20} />
          <span>Salva Preventivo</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Customer & Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                  <User size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Dati Cliente</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Cliente / Ragione Sociale</label>
                  <input
                    {...register('customerName', { required: 'Nome cliente obbligatorio' })}
                    className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                    placeholder="Es. Mario Rossi o Azienda SRL"
                  />
                  {errors.customerName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.customerName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">P.IVA / Codice Fiscale</label>
                  <input
                    {...register('customerVat')}
                    className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Indirizzo Completo</label>
                  <input
                    {...register('customerAddress')}
                    className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                    placeholder="Via Roma 1, 00100 Roma (RM)"
                  />
                </div>
              </div>
            </div>

            {/* Document Details Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                  <Calendar size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Dettagli Documento</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Numero Preventivo</label>
                  <input
                    {...register('number', { required: true })}
                    className="block w-full rounded-xl border-slate-200 shadow-sm bg-slate-100 text-slate-500 cursor-not-allowed py-2.5 px-3 border"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Data Emissione</label>
                  <input
                    type="date"
                    {...register('date', { valueAsDate: true, required: true })}
                    className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors"
                    defaultValue={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Totals & Notes */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                  <Calculator size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Riepilogo</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-slate-600">
                  <span>Imponibile</span>
                  <span className="font-medium">€ {watch('subtotal')?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA Totale</span>
                  <span className="font-medium">€ {watch('vatTotal')?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-lg font-bold text-slate-800">Totale</span>
                  <span className="text-2xl font-bold text-blue-600">€ {watch('total')?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Note Aggiuntive</label>
                <textarea
                  {...register('notes')}
                  className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-slate-50 border transition-colors text-sm"
                  rows={4}
                  placeholder="Note visibili sul preventivo (es. validità offerta, tempi consegna...)"
                />
              </div>
              
              {settings && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Eye size={18} className="text-slate-500" />
                      <span className="text-sm font-semibold text-slate-700">Anteprima PDF</span>
                    </div>
                    <span className="text-xs text-slate-500">Aggiornata in tempo reale</span>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <PDFViewer style={{ width: '100%', height: 420 }}>
                      <QuotePDF
                        quote={{
                          number: getValues('number') || '',
                          date: getValues('date') || new Date(),
                          customerName: getValues('customerName') || '',
                          customerAddress: getValues('customerAddress') || '',
                          customerVat: getValues('customerVat') || '',
                          items: getValues('items') || [],
                          attachments: getValues('attachments') || [],
                          attachmentsPosition: getValues('attachmentsPosition') || 'after',
                          tocText: getValues('tocText') || '',
                          premessaText: getValues('premessaText') || '',
                          premessaHardwareImages: getValues('premessaHardwareImages') || [],
                          premessaHardwareImageHeight: getValues('premessaHardwareImageHeight') || undefined,
                          softwareText: getValues('softwareText') || '',
                          softwareImages: getValues('softwareImages') || [],
                          softwareImageHeight: getValues('softwareImageHeight') || undefined,
                          targetAudienceImages: getValues('targetAudienceImages') || [],
                          targetAudienceImageHeight: getValues('targetAudienceImageHeight') || undefined,
                          descrizioneProdottiText: getValues('descrizioneProdottiText') || '',
                          subtotal: getValues('subtotal') || 0,
                          vatTotal: getValues('vatTotal') || 0,
                          total: getValues('total') || 0,
                          notes: getValues('notes') || '',
                          createdAt: new Date(),
                        }}
                        settings={settings}
                      />
                    </PDFViewer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Section (Full Width) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Articoli e Servizi</h2>
            <button
              type="button"
              onClick={() => {
                append({ 
                  code: '', 
                  description: '', 
                  quantity: 1, 
                  unitPrice: 0, 
                  vat: settings.defaultVat, 
                  total: 0 
                });
                recalcTotals();
              }}
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold flex items-center space-x-1"
            >
              <Plus size={18} />
              <span>Aggiungi Riga</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Codice</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrizione</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Q.tà</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Prezzo (€)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">IVA (%)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Totale (€)</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <select
                        onChange={(e) => onArticleSelect(index, e.target.value)}
                        className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                      >
                        <option value="">Seleziona...</option>
                        {articles?.map(a => (
                          <option key={a.id} value={a.id}>{a.code}</option>
                        ))}
                      </select>
                      {/* Hidden field for manual code entry if needed, for now just show selected code */}
                    </td>
                    <td className="p-3">
                      <input
                        {...register(`items.${index}.description` as const, { required: true })}
                        className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                        placeholder="Descrizione..."
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        {...register(`items.${index}.quantity` as const, { 
                          required: true, 
                          valueAsNumber: true,
                          onChange: () => onItemChange(index)
                        })}
                        className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border text-center"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.unitPrice` as const, { 
                          required: true, 
                          valueAsNumber: true,
                          onChange: () => onItemChange(index)
                        })}
                        className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border text-right"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        {...register(`items.${index}.vat` as const, { 
                          required: true, 
                          valueAsNumber: true,
                          onChange: () => onItemChange(index)
                        })}
                        className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border text-center"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.total` as const, { valueAsNumber: true })}
                        className="w-full rounded-lg border-slate-200 shadow-sm bg-slate-50 text-slate-600 text-sm py-2 px-3 border text-right font-medium"
                        readOnly
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          remove(index);
                          recalcTotals();
                        }}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {fields.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Nessun articolo inserito. Clicca su "Aggiungi Riga" per iniziare.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* PDF Attachments Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Allegati PDF (foto e descrizioni)</h2>
            <button
              type="button"
              onClick={() =>
                attachAppend({
                  title: `Pagina ${attachFields.length + 1}`,
                  description: `Descrizione ${attachFields.length + 1}`,
                  imageData: '',
                  layout: {
                    imagePosition: settings?.attachmentsDefaults?.layout?.imagePosition ?? 'top',
                    imageHeight: settings?.attachmentsDefaults?.layout?.imageHeight ?? 300,
                    descriptionFontSize: settings?.attachmentsDefaults?.layout?.descriptionFontSize ?? 11,
                    descriptionColor: settings?.attachmentsDefaults?.layout?.descriptionColor ?? '#333333',
                    showTitle: settings?.attachmentsDefaults?.layout?.showTitle ?? true,
                    fullPageImage: settings?.attachmentsDefaults?.layout?.fullPageImage ?? false
                  }
                })
              }
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold flex items-center space-x-1"
            >
              <Plus size={18} />
              <span>Aggiungi Allegato</span>
            </button>
          </div>
          
          <div className="mt-6 bg-slate-50/60 rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Struttura Documento</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Testo sotto Indice</label>
                <textarea
                  {...register('tocText' as const)}
                  rows={3}
                  className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                  placeholder="Testo introduttivo dell'indice..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Premessa - Descrizione</label>
                <textarea
                  {...register('premessaText' as const)}
                  rows={3}
                  className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                  placeholder="Breve descrizione della premessa..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Premessa - Immagini Hardware (6)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[0,1,2,3,4,5].map(i => (
                    <input
                      key={`hw-${i}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => onHardwareImageChange(i, e.target.files?.[0])}
                      className="rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Altezza immagini hardware (px)</label>
                  <input
                    type="number"
                    {...register('premessaHardwareImageHeight' as const, { valueAsNumber: true })}
                    className="w-48 rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                    placeholder="150"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Software - Descrizione</label>
                <textarea
                  {...register('softwareText' as const)}
                  rows={3}
                  className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                  placeholder="Breve descrizione del software..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Software - Immagini (6)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[0,1,2,3,4,5].map(i => (
                    <input
                      key={`sw-${i}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => onSoftwareImageChange(i, e.target.files?.[0])}
                      className="rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Altezza immagini software (px)</label>
                  <input
                    type="number"
                    {...register('softwareImageHeight' as const, { valueAsNumber: true })}
                    className="w-48 rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                    placeholder="150"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">A chi ci rivolgiamo - Immagini (9)</label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[0,1,2,3,4].map(i => (
                    <input
                      key={`aud-top-${i}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => onTargetAudienceImageChange(i, e.target.files?.[0])}
                      className="rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-3">
                  {[5,6,7,8].map(i => (
                    <input
                      key={`aud-bottom-${i}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => onTargetAudienceImageChange(i, e.target.files?.[0])}
                      className="rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Altezza immagini (px)</label>
                  <input
                    type="number"
                    {...register('targetAudienceImageHeight' as const, { valueAsNumber: true })}
                    className="w-48 rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                    placeholder="120"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">2. Descrizione Prodotti - Testo</label>
                <textarea
                  {...register('descrizioneProdottiText' as const)}
                  rows={4}
                  className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                  placeholder="Descrizione dettagliata dei prodotti..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {attachFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Titolo pagina {index + 1}</label>
                  <input
                    {...register(`attachments.${index}.title` as const, { required: true })}
                    className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                    placeholder="Titolo della pagina"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Immagine {index + 1} (file)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onAttachmentFileChange(index, e.target.files?.[0])}
                    className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                  />
                  <input type="hidden" {...register(`attachments.${index}.imageData` as const)} />
                  <p className="text-xs text-slate-400 mt-1">Carica un file immagine dal tuo pc.</p>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Descrizione {index + 1}</label>
                  <textarea
                    {...register(`attachments.${index}.description` as const, { required: true })}
                    rows={4}
                    className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                    placeholder="Dettagli, caratteristiche, garanzie, etc."
                  />
                </div>
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Posizione immagine</label>
                    <select
                      {...register(`attachments.${index}.layout.imagePosition` as const)}
                      className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                    >
                      <option value="top">Sopra</option>
                      <option value="bottom">Sotto</option>
                      <option value="left">Sinistra</option>
                      <option value="right">Destra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Altezza immagine (px)</label>
                    <input
                      type="number"
                      {...register(`attachments.${index}.layout.imageHeight` as const, { valueAsNumber: true })}
                      className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                      placeholder="300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Dimensione testo descrizione</label>
                    <input
                      type="number"
                      {...register(`attachments.${index}.layout.descriptionFontSize` as const, { valueAsNumber: true })}
                      className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                      placeholder="11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Colore descrizione</label>
                    <input
                      type="color"
                      {...register(`attachments.${index}.layout.descriptionColor` as const)}
                      className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                    />
                  </div>
                  <div className="md:col-span-4 flex items-center space-x-3">
                    <input
                      type="checkbox"
                      {...register(`attachments.${index}.layout.showTitle` as const)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Mostra titolo in PDF</span>
                  </div>
                  <div className="md:col-span-4 flex items-center space-x-3">
                    <input
                      type="checkbox"
                      {...register(`attachments.${index}.layout.fullPageImage` as const)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Immagine a pagina intera</span>
                  </div>
                </div>
                <div className="md:col-span-3 flex justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => index > 0 && attachMove(index, index - 1)}
                      className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-sm border border-slate-200"
                      disabled={index === 0}
                    >
                      Su
                    </button>
                    <button
                      type="button"
                      onClick={() => index < attachFields.length - 1 && attachMove(index, index + 1)}
                      className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-sm border border-slate-200"
                      disabled={index === attachFields.length - 1}
                    >
                      Giù
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => attachRemove(index)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {attachFields.length === 0 && (
              <p className="text-sm text-slate-500">Nessun allegato. Aggiungi una pagina con foto e descrizione.</p>
            )}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Posizione allegati nel PDF</label>
            <select
              {...register('attachmentsPosition' as const)}
              className="w-full md:w-64 rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
            >
              <option value="after">Dopo il preventivo</option>
              <option value="before">Prima del preventivo</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

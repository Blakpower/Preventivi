import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, type Quote, type Settings, type Article, type Customer, getCurrentUserId } from '../db';
import { Plus, Trash2, Save, ArrowLeft, Calculator, User, Calendar, Eye, Coins, Package } from 'lucide-react';
import { format } from 'date-fns';
import { PDFViewer } from '@react-pdf/renderer';
import { QuotePDF } from '../components/QuotePDF';
import { LeasingForm } from '../components/LeasingForm';
import { CustomerForm } from '../components/CustomerForm';
import { ArticleForm } from '../components/ArticleForm';

export const NewQuote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | undefined>(undefined);
  const [articles, setArticles] = useState<Article[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showLeasing, setShowLeasing] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      const uid = getCurrentUserId();
      if (!uid) return;

      // Settings
      try {
        const { data: settingsData } = await supabase
          .from('settings')
          .select('*')
          .eq('userId', uid)
          .abortSignal(controller.signal)
          .single();
        if (settingsData) setSettings(settingsData);
      } catch (e) {
        const err = e as { name?: string; message?: string };
        if (err?.name === 'AbortError' || String(err?.message).includes('Abort')) return;
        console.error('Error fetching settings:', e);
      }

      // Articles
      try {
        const { data: articlesData } = await supabase
          .from('articles')
          .select('*')
          .eq('ownerUserId', uid)
          .abortSignal(controller.signal);
        if (articlesData) setArticles(articlesData);
      } catch (e) {
        const err = e as { name?: string; message?: string };
        if (err?.name === 'AbortError' || String(err?.message).includes('Abort')) return;
        console.error('Error fetching articles:', e);
      }

      // Customers
      try {
        const { data: customersData } = await supabase
          .from('customers')
          .select('*')
          .eq('ownerUserId', uid)
          .order('name', { ascending: true })
          .abortSignal(controller.signal);
        if (customersData) setCustomers(customersData);
      } catch (e) {
        const err = e as { name?: string; message?: string };
        if (err?.name === 'AbortError' || String(err?.message).includes('Abort')) return;
        console.error('Error fetching customers:', e);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  const { register, control, handleSubmit, watch, setValue, getValues, reset, formState: { errors }, clearErrors } = useForm<Quote>({
    defaultValues: {
      date: new Date(),
      items: [],
      attachments: [],
      attachmentsPosition: 'after',
      leasing: undefined, // Default no leasing
      tocTextAbove: 'A proseguimento dei colloqui intercorsi siamo lieti di sottoporVi la ns. Migliore offerta relativa a quanto in oggetto, così articolata:',
      tocText: 'Nell\'augurarci che la presente possa fornirVi gli elementi necessari a valutare la qualità della ns. soluzione, Vi confermiamo la ns. completa disponibilità per ogni ulteriore chiarimento e, nel ringraziarVi per la Vs. preferenza, cogliamo l’occasione per porgerVi i ns. più cordiali saluti.',
      premessaText: 'La Esse Group SRL è un’Azienda formata da elementi con pluriennale esperienza nel settore Retail, e promuove la vendita di qualificati marchi, sia hardware che software, tra i quali:',
      premessaHardwareImages: [],
      premessaHardwareImageCount: 0,
      softwareText: "Il nostro progetto è nato nel 2012 e, ad oggi, vantiamo numerose installazioni in tutta la regione. L'obiettivo dell'azienda, oltre quello di offrire alla propria clientela tutte le attrezzature e le soluzioni hardware e software necessarie per una corretta gestione della propria attività commerciale, è soprattutto quello di garantire l'assistenza post-vendita. A tal fine mette a disposizione dei propri Clienti una qualificata struttura di Assistenza Tecnica ed un efficientissimo servizio di Help Desk che garantiscono la pronta risoluzione di qualunque problematica sia Hardware che Software in tempi estremamente rapidi.",
      softwareImages: [],
      softwareImageCount: 0,
      softwareImageScale: 80,
      targetAudienceImages: [],
      targetAudienceImageCount: 0,
      targetAudienceImageScale: 70,
      descrizioneProdottiText: '',
      descrizioneProdottiImages: [],
      descrizioneProdottiCaptions: [],
      descrizioneProdottiImageCount: 0,
      descrizioneProdottiImageFit: 'contain',
      descrizioneProdottiFirstImageScale: 190,
      conditionsList: [],
      conditionsCount: 0,
      subtotal: 0,
      vatTotal: 0,
      total: 0,
      notes: ''
    }
  });

  const watchedValues = watch();
  const [autoPreview, setAutoPreview] = useState(false);
  const lastSerialized = useRef<string>('');
  const [previewValues, setPreviewValues] = useState(watchedValues);
  const watchedFields = useWatch({
    control,
    name: [
      'number','date','items','attachments',
      'customerName','customerAddress','customerVat',
      'tocTextAbove','tocText','premessaText','softwareText',
      'descrizioneProdottiText','conditionsList','leasing','attachmentsPosition',
      'showTotals', 'notes'
    ],
  });
  useEffect(() => {
    if (!autoPreview) return;
    const t = setTimeout(() => {
      const candidate = getValues();
      const subset = {
        number: candidate.number,
        date: candidate.date,
        items: candidate.items,
        attachments: candidate.attachments,
        customerName: candidate.customerName,
        customerAddress: candidate.customerAddress,
        customerVat: candidate.customerVat,
        tocTextAbove: candidate.tocTextAbove,
        tocText: candidate.tocText,
        premessaText: candidate.premessaText,
        softwareText: candidate.softwareText,
        descrizioneProdottiText: candidate.descrizioneProdottiText,
        conditionsList: candidate.conditionsList,
        leasing: candidate.leasing,
        attachmentsPosition: candidate.attachmentsPosition,
        showTotals: candidate.showTotals,
        notes: candidate.notes,
      };
      const serialized = JSON.stringify(subset);
      if (serialized !== lastSerialized.current) {
        setPreviewValues(candidate);
        lastSerialized.current = serialized;
      }
    }, 500);
    return () => clearTimeout(t);
  }, [autoPreview, watchedFields]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });
  const { fields: attachFields, append: attachAppend, remove: attachRemove, move: attachMove } = useFieldArray({
    control,
    name: 'attachments'
  });

  // Watch items to calculate totals (handled via recalcTotals in change handlers)

  const lastAutoGeneratedText = useRef<string>('');
  const items = watch('items');

  useEffect(() => {
    const currentText = getValues('descrizioneProdottiText') || '';
    const currentItems = items || [];
    const generatedText = (currentItems || [])
      .filter(item => item && item.description)
      .map(item => `${item.code ? `${item.code} - ` : ''}${item.description}`)
      .join('\n');
      
    // Initial populate when empty
    if (!currentText.trim() && generatedText) {
      setValue('descrizioneProdottiText', generatedText, { shouldDirty: true, shouldValidate: true });
      lastAutoGeneratedText.current = generatedText;
      return;
    }
    
    // console.log('AutoPopulate Debug:', { currentText, generatedText, lastAuto: lastAutoGeneratedText.current });

    // Handle initialization or re-sync
    if (!lastAutoGeneratedText.current) {
      if (!currentText || currentText === generatedText) {
        lastAutoGeneratedText.current = generatedText;
      } else {
        // If there is existing text but no history, we assume it might contain the list or be notes.
        // We set lastAuto to generatedText only if we can verify it matches? 
        // Actually, for the first run, if we want to support "Add item to existing notes", 
        // we should probably NOT set lastAutoGeneratedText.current yet, 
        // OR we treat '' as the lastAuto (which it is).
        // If we treat '' as lastAuto, the logic below (startsWith) will Prepend generatedText to currentText.
        // This effectively "Populates" the list into the existing text.
        // But we must be careful not to do this if the list is ALREADY there.
        
        // Simple check: does currentText contain generatedText?
        if (generatedText && currentText.includes(generatedText)) {
             lastAutoGeneratedText.current = generatedText;
        }
      }
    }

    // Logic to update text while preserving manual edits (prefixes/suffixes)
    if (lastAutoGeneratedText.current !== undefined) { // .current can be ''
      if (currentText === lastAutoGeneratedText.current) {
        // No manual edits, full overwrite
        if (generatedText !== currentText) {
          setValue('descrizioneProdottiText', generatedText, { shouldDirty: true, shouldValidate: true });
          lastAutoGeneratedText.current = generatedText;
        }
      } else {
        // Manual edits detected. Try to preserve them.
        if (currentText.startsWith(lastAutoGeneratedText.current)) {
          // Suffix detected (e.g. notes at end)
          const suffix = currentText.substring(lastAutoGeneratedText.current.length);
          const newText = generatedText + suffix;
          if (newText !== currentText) {
            setValue('descrizioneProdottiText', newText, { shouldDirty: true, shouldValidate: true });
            lastAutoGeneratedText.current = generatedText;
          }
        } else if (currentText.endsWith(lastAutoGeneratedText.current)) {
          // Prefix detected (e.g. notes at start)
          const prefix = currentText.substring(0, currentText.length - lastAutoGeneratedText.current.length);
          const newText = prefix + generatedText;
          if (newText !== currentText) {
            setValue('descrizioneProdottiText', newText, { shouldDirty: true, shouldValidate: true });
            lastAutoGeneratedText.current = generatedText;
          }
        }
      }
    }
  }, [items, setValue, getValues]);

  useEffect(() => {
    const loadData = async () => {
      const uid = getCurrentUserId();
      
      // If editing, load the quote
      if (id && uid) {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .eq('id', Number(id)) // Ensure number
          .eq('ownerUserId', uid) // Ensure we only get our own quote
          .maybeSingle();

        if (error) {
            console.error('Error fetching quote:', error);
            alert('Errore nel caricamento del preventivo: ' + error.message);
          } else if (data) {
            const quote = data as any; // Cast to any to handle JSON fields
            const items = typeof quote.items === 'string' ? JSON.parse(quote.items) : quote.items;
            const attachments = typeof quote.attachments === 'string' ? JSON.parse(quote.attachments) : quote.attachments;
            const premessaHardwareImages = typeof quote.premessaHardwareImages === 'string' ? JSON.parse(quote.premessaHardwareImages) : quote.premessaHardwareImages;
            const softwareImages = typeof quote.softwareImages === 'string' ? JSON.parse(quote.softwareImages) : quote.softwareImages;
            const targetAudienceImages = typeof quote.targetAudienceImages === 'string' ? JSON.parse(quote.targetAudienceImages) : quote.targetAudienceImages;
            const descrizioneProdottiImages = typeof quote.descrizioneProdottiImages === 'string' ? JSON.parse(quote.descrizioneProdottiImages) : quote.descrizioneProdottiImages;
            const conditionsList = typeof quote.conditionsList === 'string' ? JSON.parse(quote.conditionsList) : quote.conditionsList;
            const leasing = quote.leasing ? (typeof quote.leasing === 'string' ? JSON.parse(quote.leasing) : quote.leasing) : undefined;
            
            if (leasing) {
              setShowLeasing(true);
            }

            reset({
              ...quote,
              date: new Date(quote.date),
              items: items || [],
              attachments: attachments || [],
              premessaHardwareImages: premessaHardwareImages || [],
              softwareImages: softwareImages || [],
              targetAudienceImages: targetAudienceImages || [],
              descrizioneProdottiImages: descrizioneProdottiImages || [],
              conditionsList: conditionsList || [],
              leasing: leasing,
              attachmentsPosition: quote.attachmentsPosition || 'after'
            });
          } else {
             alert('Preventivo non trovato.');
             navigate('/');
          }
      }
    };
    loadData();
  }, [id, reset, navigate]);

  useEffect(() => {
    if (!id && settings && !getValues('number')) {
      setValue('number', `${settings.quoteNumberPrefix}${settings.nextQuoteNumber}`);
      if (settings.attachmentsDefaults?.position) {
        setValue('attachmentsPosition', settings.attachmentsDefaults.position);
      }
      // Precarica immagini di default se presenti e se non già impostate da last-quote
      const hwArr = getValues('premessaHardwareImages') || [];
      if (settings.defaultHardwareImage && (!hwArr || hwArr.length === 0 || !hwArr[0])) {
        setValue('premessaHardwareImages', [settings.defaultHardwareImage], { shouldDirty: true });
        if (!getValues('premessaHardwareImageCount')) setValue('premessaHardwareImageCount', 1, { shouldDirty: true });
      }
      const swArr = getValues('softwareImages') || [];
      if (settings.defaultSoftwareImage && (!swArr || swArr.length === 0 || !swArr[0])) {
        setValue('softwareImages', [settings.defaultSoftwareImage], { shouldDirty: true });
        if (!getValues('softwareImageCount')) setValue('softwareImageCount', 1, { shouldDirty: true });
      }
      const audArr = getValues('targetAudienceImages') || [];
      if (settings.defaultTargetImage && (!audArr || audArr.length === 0 || !audArr[0])) {
        setValue('targetAudienceImages', [settings.defaultTargetImage], { shouldDirty: true });
        if (!getValues('targetAudienceImageCount')) setValue('targetAudienceImageCount', 1, { shouldDirty: true });
      }
      const descArr = getValues('descrizioneProdottiImages') || [];
      if (settings.defaultDescrizioneImage && (!descArr || descArr.length === 0 || !descArr[0])) {
        setValue('descrizioneProdottiImages', [settings.defaultDescrizioneImage], { shouldDirty: true });
        if (!getValues('descrizioneProdottiImageCount')) setValue('descrizioneProdottiImageCount', 1, { shouldDirty: true });
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

  const onDescriptionChange = (index: number, description: string) => {
    const article = articles?.find(a => a.description.toLowerCase() === description.toLowerCase());
    if (article) {
      setValue(`items.${index}.unitPrice`, article.unitPrice);
      setValue(`items.${index}.vat`, article.vat);
      const qty = getValues(`items.${index}.quantity`) || 1;
      setValue(`items.${index}.total`, qty * article.unitPrice);
      recalcTotals();
    }
  };

  const onItemChange = (index: number) => {
    const qty = getValues(`items.${index}.quantity`) || 0;
    const price = getValues(`items.${index}.unitPrice`) || 0;
    setValue(`items.${index}.total`, qty * price);
    recalcTotals();
  };

  const onCustomerSelect = (customerId: string) => {
    if (!customerId) return;
    const customer = customers?.find(c => c.id === Number(customerId));
    if (customer) {
      setValue('customerId', customer.id);
      setValue('customerName', customer.name);
      setValue('customerVat', customer.vat);
      setValue('customerAddress', customer.address);
      clearErrors(['customerName', 'customerVat', 'customerAddress']);
    }
  };

  const handleCreateCustomer = async (data: Omit<Customer, 'id'>) => {
    const uid = getCurrentUserId();
    if (!uid) return;

    try {
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([{ ...data, ownerUserId: uid }])
        .select()
        .single();

      if (error) throw error;

      if (newCustomer) {
        setCustomers(prev => [...prev, newCustomer].sort((a, b) => a.name.localeCompare(b.name)));
        onCustomerSelect(String(newCustomer.id));
        setIsCustomerModalOpen(false);
      }
    } catch (error: any) {
      console.error('Error creating customer:', error);
      alert('Errore durante la creazione del cliente: ' + error.message);
    }
  };

  const handleCreateArticle = async (data: Omit<Article, 'id'>) => {
    const uid = getCurrentUserId();
    if (!uid) return;

    try {
      const { data: newArticle, error } = await supabase
        .from('articles')
        .insert([{ ...data, ownerUserId: uid }])
        .select()
        .single();

      if (error) throw error;

      if (newArticle) {
        setArticles(prev => [...prev, newArticle].sort((a, b) => a.description.localeCompare(b.description)));
        append({
            code: newArticle.code || '',
            description: newArticle.description,
            quantity: 1,
            unitPrice: newArticle.unitPrice,
            vat: newArticle.vat,
            total: newArticle.unitPrice
        });
        recalcTotals();
        setIsArticleModalOpen(false);
      }
    } catch (error: any) {
      console.error('Error creating article:', error);
      alert('Errore durante la creazione del cliente: ' + error.message);
    }
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

  const hwCount = watch('premessaHardwareImageCount') || 0;
  useEffect(() => {
    const current = getValues('premessaHardwareImages') || [];
    if (hwCount > current.length) {
      setValue('premessaHardwareImages', [
        ...current,
        ...Array(hwCount - current.length).fill('')
      ], { shouldDirty: true });
    } else if (hwCount < current.length) {
      setValue('premessaHardwareImages', current.slice(0, hwCount), { shouldDirty: true });
    }
  }, [hwCount]);

  const swCount = watch('softwareImageCount') || 0;
  useEffect(() => {
    const current = getValues('softwareImages') || [];
    if (swCount > current.length) {
      setValue('softwareImages', [
        ...current,
        ...Array(swCount - current.length).fill('')
      ], { shouldDirty: true });
    } else if (swCount < current.length) {
      setValue('softwareImages', current.slice(0, swCount), { shouldDirty: true });
    }
  }, [swCount]);

  const audCount = watch('targetAudienceImageCount') || 0;
  useEffect(() => {
    const current = getValues('targetAudienceImages') || [];
    if (audCount > current.length) {
      setValue('targetAudienceImages', [
        ...current,
        ...Array(audCount - current.length).fill('')
      ], { shouldDirty: true });
    } else if (audCount < current.length) {
      setValue('targetAudienceImages', current.slice(0, audCount), { shouldDirty: true });
    }
  }, [audCount]);
  const onDescrizioneProdottiImageChange = async (idx: number, file?: File) => {
    if (!file) return;
    const dataUrl = await toBase64(file);
    const arr = getValues('descrizioneProdottiImages') || [];
    arr[idx] = dataUrl;
    setValue('descrizioneProdottiImages', arr, { shouldDirty: true });
  };

  const descrizioneCount = watch('descrizioneProdottiImageCount') || 0;
  useEffect(() => {
    const current = getValues('descrizioneProdottiImages') || [];
    if (descrizioneCount > current.length) {
      setValue('descrizioneProdottiImages', [
        ...current,
        ...Array(descrizioneCount - current.length).fill('')
      ], { shouldDirty: true });
    } else if (descrizioneCount < current.length) {
      setValue('descrizioneProdottiImages', current.slice(0, descrizioneCount), { shouldDirty: true });
    }
  }, [descrizioneCount]);
  const conditionsCount = watch('conditionsCount') || 0;
  useEffect(() => {
    const current = getValues('conditionsList') || [];
    if (conditionsCount > current.length) {
      setValue('conditionsList', [
        ...current,
        ...Array(conditionsCount - current.length).fill('')
      ], { shouldDirty: true });
    } else if (conditionsCount < current.length) {
      setValue('conditionsList', current.slice(0, conditionsCount), { shouldDirty: true });
    }
  }, [conditionsCount]);

  useEffect(() => {
    (async () => {
      if (id) return;
      try {
        const uid = getCurrentUserId();
        if (!uid) return;
        
        const { data: quotes } = await supabase
          .from('quotes')
          .select('*')
          .eq('ownerUserId', uid)
          .order('createdAt', { ascending: false })
          .limit(1);
          
        const last = quotes && quotes.length > 0 ? quotes[0] : null;

        if (!last) return;
        if (last.tocTextAbove) setValue('tocTextAbove', last.tocTextAbove);
        if (last.premessaText) setValue('premessaText', last.premessaText);
        if (last.premessaHardwareImages) setValue('premessaHardwareImages', last.premessaHardwareImages);
        if (last.premessaHardwareImageHeight) setValue('premessaHardwareImageHeight', last.premessaHardwareImageHeight);
        if (last.premessaHardwareImageCount) setValue('premessaHardwareImageCount', last.premessaHardwareImageCount);
        if (last.premessaHardwareImageScale) setValue('premessaHardwareImageScale', last.premessaHardwareImageScale);
        if (last.softwareText) setValue('softwareText', last.softwareText);
        if (last.softwareImages) setValue('softwareImages', last.softwareImages);
        if (last.softwareImageHeight) setValue('softwareImageHeight', last.softwareImageHeight);
        if (last.softwareImageCount) setValue('softwareImageCount', last.softwareImageCount);
        if (last.softwareImageScale) setValue('softwareImageScale', last.softwareImageScale);
        if (last.targetAudienceImages) setValue('targetAudienceImages', last.targetAudienceImages);
        if (last.targetAudienceImageHeight) setValue('targetAudienceImageHeight', last.targetAudienceImageHeight);
        if (last.targetAudienceImageCount) setValue('targetAudienceImageCount', last.targetAudienceImageCount);
        if (last.targetAudienceImageScale) setValue('targetAudienceImageScale', last.targetAudienceImageScale);
        if (last.descrizioneProdottiImages) setValue('descrizioneProdottiImages', last.descrizioneProdottiImages);
        if (last.descrizioneProdottiImageCount) setValue('descrizioneProdottiImageCount', last.descrizioneProdottiImageCount);
        if (last.descrizioneProdottiImageFit) setValue('descrizioneProdottiImageFit', last.descrizioneProdottiImageFit);
        if (last.descrizioneProdottiFirstImageScale) setValue('descrizioneProdottiFirstImageScale', last.descrizioneProdottiFirstImageScale);
        if (last.conditionsList) setValue('conditionsList', last.conditionsList);
        if (last.conditionsCount) setValue('conditionsCount', last.conditionsCount);
      } catch (e) {
        console.error('Load last quote defaults failed', e);
      }
    })();
  }, [setValue, id]);

  const onSubmit = async (data: Quote) => {
    try {
      if (!settings) return;

      const uid = getCurrentUserId();
      if (!uid) {
        alert('Utente non autenticato');
        return;
      }
      
      console.log('Submitting quote. ID:', id, 'Data:', data);
      console.log('Settings:', settings);

      // Prepare payload - ensure undefined values are removed or handled if needed
      const payload: any = {
        ...data,
        ownerUserId: uid,
      };
      
      // Remove id from payload if it exists
      delete payload.id;

      // Remove fields that are now managed globally via Settings and not stored per-quote
      // This prevents errors if these columns don't exist in the DB schema and ensures global settings are used
      delete payload.premessaHardwareImages;
      delete payload.premessaHardwareImageScale;
      delete payload.premessaHardwareImageCount;
      delete payload.premessaHardwareImageHeight;
      
      delete payload.softwareImages;
      delete payload.softwareImageScale;
      delete payload.softwareImageCount;
      delete payload.softwareImageHeight;
      
      delete payload.targetAudienceImages;
      delete payload.targetAudienceImageScale;
      delete payload.targetAudienceImageCount;
      delete payload.targetAudienceImageHeight;

      console.log('Payload prepared:', payload);

      if (id) {
        const { error } = await supabase
          .from('quotes')
          .update(payload)
          .eq('id', Number(id));
          
        if (error) {
          console.error('Supabase Update Error:', error);
          throw error;
        }
      } else {
        const numberValue = data.number && String(data.number).trim() ? data.number : `${settings.quoteNumberPrefix}${settings.nextQuoteNumber}`;
        payload.number = numberValue;
        payload.createdAt = new Date();
        
        const { error } = await supabase
          .from('quotes')
          .insert(payload);
          
        if (error) {
          console.error('Supabase Insert Error:', error);
          throw error;
        }

        // Update next quote number
        await supabase
          .from('settings')
          .update({
            nextQuoteNumber: settings.nextQuoteNumber + 1,
            attachmentsDefaults: {
              position: data.attachmentsPosition,
              layout: data.attachments && data.attachments[0]?.layout ? data.attachments[0]?.layout : settings.attachmentsDefaults?.layout
            }
          })
          .eq('id', settings.id);
      }

      navigate('/quotes');
    } catch (error: any) {
      console.error('Error saving quote:', error);
      alert(`Errore durante il salvataggio del preventivo: ${error.message || JSON.stringify(error)}`);
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
            <h1 className="text-3xl font-bold text-slate-900">{id ? 'Modifica Preventivo' : 'Nuovo Preventivo'}</h1>
            <p className="text-slate-500 mt-1">{id ? 'Modifica i dati del preventivo esistente.' : 'Compila i dati per creare un nuovo documento.'}</p>
          </div>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 font-semibold"
        >
          <Save size={20} />
          <span>{id ? 'Aggiorna Preventivo' : 'Salva Preventivo'}</span>
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

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Seleziona da Database (Opzionale)</label>
                <div className="flex space-x-2">
                  <select
                    onChange={(e) => onCustomerSelect(e.target.value)}
                    className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-white border transition-colors"
                  >
                    <option value="">-- Seleziona un cliente salvato --</option>
                    {customers?.map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.vat ? `(${c.vat})` : ''}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="flex-none bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center"
                    title="Crea nuovo cliente"
                  >
                    <Plus size={20} />
                  </button>
                </div>
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
                    <div className="flex items-center space-x-3">
                      <label className="text-xs text-slate-600 flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={autoPreview}
                          onChange={(e) => setAutoPreview(e.target.checked)}
                          className="rounded"
                        />
                        <span>Auto</span>
                      </label>
                      {!autoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            const candidate = getValues();
                            const subset = {
                              number: candidate.number,
                              date: candidate.date,
                              items: candidate.items,
                              attachments: candidate.attachments,
                              customerName: candidate.customerName,
                              customerAddress: candidate.customerAddress,
                              customerVat: candidate.customerVat,
                              tocTextAbove: candidate.tocTextAbove,
                              tocText: candidate.tocText,
                              premessaText: candidate.premessaText,
                              softwareText: candidate.softwareText,
                              descrizioneProdottiText: candidate.descrizioneProdottiText,
                              conditionsList: candidate.conditionsList,
                              leasing: candidate.leasing,
                              attachmentsPosition: candidate.attachmentsPosition,
                              showTotals: candidate.showTotals,
                              notes: candidate.notes,
                            };
                            setPreviewValues(candidate);
                            lastSerialized.current = JSON.stringify(subset);
                          }}
                          className="text-xs px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50"
                        >
                          Aggiorna ora
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <PDFViewer style={{ width: '100%', height: 420 }}>
                      <QuotePDF
                        quote={{
                          ...previewValues,
                          number: previewValues.number || getValues('number') || '',
                          date: previewValues.date || getValues('date') || new Date(),
                          createdAt: new Date(),
                          items: previewValues.items || [],
                          attachments: previewValues.attachments || [],
                          softwareImageScale: Number(previewValues.softwareImageScale || 100),
                          targetAudienceImageScale: Number(previewValues.targetAudienceImageScale || 100),
                          descrizioneProdottiFirstImageScale: Number(previewValues.descrizioneProdottiFirstImageScale || 100),
                        } as Quote}
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
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(true)}
                className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-bold flex items-center space-x-1"
              >
                <Package size={18} />
                <span>Nuovo Articolo</span>
              </button>
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
          </div>

          <div className="overflow-x-auto">
            <datalist id="articles-list">
              {articles?.map(a => (
                <option key={a.id} value={a.description} />
              ))}
            </datalist>
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
                        {...register(`items.${index}.code` as const)}
                        className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                      >
                        <option value="">—</option>
                        {Array.from({ length: 26 }, (_, i) => `${String.fromCharCode(65 + i)}.`).map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        list="articles-list"
                        {...register(`items.${index}.description` as const, { 
                          required: true,
                          onChange: (e) => onDescriptionChange(index, e.target.value)
                        })}
                        className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                        placeholder="Cerca articolo o scrivi descrizione..."
                        autoComplete="off"
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
        
        {/* PDF{/* Leasing Section Toggle */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Coins size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Piano Leasing</h2>
              <p className="text-sm text-slate-500">Aggiungi un piano di leasing al preventivo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
                if (showLeasing) {
                    setValue('leasing', undefined);
                }
                setShowLeasing(!showLeasing);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showLeasing 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            {showLeasing ? 'Rimuovi Leasing' : 'Aggiungi Leasing'}
          </button>
        </div>
        
        {showLeasing && (
             <LeasingForm form={{ register, control, handleSubmit, watch, setValue, getValues, reset, formState: { errors }, clearErrors } as any} />
        )}
      </div>

      {/* Attachments Section */}
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
                <label className="block text-sm font-semibold text-slate-700 mb-1">Testo sopra Indice</label>
                <textarea
                  {...register('tocTextAbove' as const)}
                  rows={3}
                  className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                  placeholder="Testo sopra l'indice..."
                />
              </div>
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
                <label className="block text-sm font-semibold text-slate-700 mb-1 text-center">Hardware</label>
                <div className="text-xs text-slate-500 text-center mb-3">Immagini e scala configurabili dalle impostazioni generali</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 text-center">Software</label>
                <div className="text-xs text-slate-500 text-center mb-3">Immagini e scala configurabili dalle impostazioni generali</div>
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
                <label className="block text-sm font-semibold text-slate-700 mb-1 text-center">A chi ci rivolgiamo</label>
                <div className="text-xs text-slate-500 text-center mb-3">Immagini e scala configurabili dalle impostazioni generali</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">2. Descrizione Prodotti</label>
                <p className="text-xs text-slate-500 mb-3">Carica immagini e assegna didascalie (collegabili agli articoli).</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Immagini pagina intera (1–10)</label>
                <div className="flex items-center space-x-3">
                  <select
                    {...register('descrizioneProdottiImageCount' as const, { valueAsNumber: true })}
                    className="w-28 rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                  >
                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={`count-${n}`} value={n}>{n}</option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-500">Numero pagine immagini a piena pagina</span>
                </div>
                <div className="mt-3 flex items-center space-x-3">
                  <label className="block text-sm font-semibold text-slate-700">Adattamento immagine</label>
                  <select
                    {...register('descrizioneProdottiImageFit' as const)}
                    className="w-44 rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                  >
                    <option value="contain">Adatta alla pagina (consigliato)</option>
                    <option value="cover">Riempi la pagina (può tagliare)</option>
                  </select>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Scala prima immagine (percentuale)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={30}
                      max={200}
                      step={5}
                      {...register('descrizioneProdottiFirstImageScale' as const, { valueAsNumber: true })}
                      className="w-full"
                    />
                    <span className="text-sm text-slate-600">{watch('descrizioneProdottiFirstImageScale') || 100}%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Regola la dimensione della prima immagine in pagina con il testo.</p>
                </div>
                {descrizioneCount > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {Array.from({ length: descrizioneCount }).map((_, i) => (
                      <div key={`desc-prod-img-${i}`} className="p-3 border rounded-lg bg-slate-50">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Immagine {i + 1}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onDescrizioneProdottiImageChange(i, e.target.files?.[0])}
                          className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border mb-2"
                        />
                        
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Collega ad articolo</label>
                        <select
                          className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border mb-2"
                          onChange={(e) => {
                            const idx = Number(e.target.value);
                            if (idx >= 0) {
                              const items = getValues('items');
                              const item = items?.[idx];
                              if (item) {
                                setValue(`descrizioneProdottiCaptions.${i}`, `${item.code} - ${item.description}`);
                              }
                            }
                          }}
                        >
                          <option value="-1">-- Seleziona articolo --</option>
                          {watch('items')?.map((item, idx) => (
                            <option key={idx} value={idx}>
                              {item.code} - {item.description.substring(0, 50)}...
                            </option>
                          ))}
                        </select>

                        <label className="block text-xs font-semibold text-slate-700 mb-1">Didascalia (modificabile)</label>
                        <textarea
                          {...register(`descrizioneProdottiCaptions.${i}` as const)}
                          rows={3}
                          className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                          placeholder="Descrizione dell'immagine..."
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">4. Condizioni di fornitura</label>
                <div className="flex items-center space-x-3 mb-3">
                  <select
                    {...register('conditionsCount' as const, { valueAsNumber: true })}
                    className="w-28 rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                      <option key={`cond-count-${n}`} value={n}>{n}</option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-500">Numero voci condizioni</span>
                </div>
                {conditionsCount > 0 && (
                  <div className="space-y-3">
                    {Array.from({ length: conditionsCount }).map((_, i) => (
                      <div key={`cond-item-${i}`}>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Voce {i + 1}</label>
                        <input
                          {...register(`conditionsList.${i}` as const)}
                          className="w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-white border"
                          placeholder="Inserisci condizione..."
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Opzioni Offerta Economica</label>
                 <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="showTotals"
                      {...register('showTotals')}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <label htmlFor="showTotals" className="text-sm text-slate-700 select-none cursor-pointer">
                      Mostra riepilogo totali (Imponibile, IVA, Totale) nel PDF
                    </label>
                 </div>
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

      {isCustomerModalOpen && (
        <CustomerForm
          onSubmit={handleCreateCustomer}
          onCancel={() => setIsCustomerModalOpen(false)}
        />
      )}
      
      {isArticleModalOpen && (
        <ArticleForm
          onSubmit={handleCreateArticle}
          onCancel={() => setIsArticleModalOpen(false)}
        />
      )}
    </div>
  );
};

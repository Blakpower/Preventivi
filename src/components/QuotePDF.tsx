import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { type Quote, type Settings } from '../db';

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 60,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 5,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginLeft: -45,
    marginRight: -20
  },
  logoLeft: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0
  },
  logoLeftEdge: {
    marginLeft: -40
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb', // blue-600
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  quoteMeta: {
    fontSize: 10,
    color: '#666',
  },
  companyInfo: {
    alignItems: 'flex-end',
    flexGrow: 1
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logo: {
    width: 350,
    height: 100,
    objectFit: 'contain',
    marginLeft: -30,
    alignSelf: 'flex-start'
  },
  customerSection: {
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
  },
  customerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4b5563',
    textTransform: 'uppercase',
  },
  customerName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#1f2937',
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 9,
    color: '#4b5563',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  colCode: { width: '15%' },
  colDesc: { width: '40%' },
  colQty: { width: '10%', textAlign: 'right' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  totalsBox: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
    marginTop: 5,
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  bankInfo: {
    marginTop: 20,
    padding: 8,
    backgroundColor: '#1e3a8a', // Dark blue
    borderRadius: 4,
    fontSize: 9,
    color: '#ffffff',
  },
  attachmentPage: {
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 60,
    fontSize: 11,
    color: '#333',
  },
  descProdPage: {
    paddingTop: 130, // Account for fixed header height (increased for safety)
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 60,
    fontSize: 11,
    color: '#333',
  },
  contractPage: {
    padding: 40,
  },
  contractText: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.5,
  },
  attachmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#111827',
  },
  attachmentImage: {
    width: '100%',
    height: 300,
    objectFit: 'cover',
    marginBottom: 12,
  },
  fullImagePage: {
    padding: 0,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageFillContainer: {
    flexGrow: 1,
  },
  attachmentText: {
    fontSize: 11,
    lineHeight: 1.5,
  },
  // Leasing Styles
  leasingContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  leasingHeaderBox: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  leasingTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  leasingBody: {
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  leasingGroupTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 2,
  },
  leasingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  leasingLabel: {
    fontSize: 9,
    color: '#475569',
  },
  leasingValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  leasingColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leasingCol: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
    color: '#111827',
  }
});

interface QuotePDFProps {
  quote: Quote;
  settings: Settings;
}

export const QuotePDF: React.FC<QuotePDFProps> = ({ quote, settings }) => {
  // Helper for safe numbers (ensures non-negative and finite)
  const safeNumber = (val: any, def: number) => {
    const n = Number(val);
    return !Number.isFinite(n) || n < 0 ? def : n;
  };

  // Helper for safe positive numbers (strictly > 0)
  const safePositive = (val: any, def: number) => {
    const n = Number(val);
    return !Number.isFinite(n) || n <= 0 ? def : n;
  };

  // Helper for safe dates
  const safeFormatDate = (date: any, fmt: string) => {
    try {
      if (!date) return format(new Date(), fmt);
      const d = new Date(date);
      if (isNaN(d.getTime())) return format(new Date(), fmt);
      return format(d, fmt);
    } catch (e) {
      return format(new Date(), fmt);
    }
  };

  // Helper to validate image source
  const getValidImageSrc = (src: string | undefined | null) => {
    if (!src) return undefined;
    if (typeof src !== 'string') return undefined;
    if (src.length === 0) return undefined;
    // Basic check for base64 or url (including blob for local previews)
    if (!src.startsWith('data:image') && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('blob:')) return undefined;
    if (src === 'undefined' || src === 'null') return undefined;
    return src;
  };

  const contractPages = (settings.contractPagesText || '').split('---').map(p => p.trim()).filter(Boolean);
  const displayNumber = quote.number && String(quote.number).trim() ? quote.number : `${settings.quoteNumberPrefix}${settings.nextQuoteNumber}`;
  const attachments = Array.isArray(quote.attachments) ? quote.attachments : [];
  const attachmentsBefore = (quote.attachmentsPosition || 'after') === 'before';
  const renderHeader = (isFixed = false) => {
    const logoSrc = getValidImageSrc(settings.logoData) || getValidImageSrc(settings.logoUrl);
    return (
    <View fixed={isFixed}>
      <View style={styles.header}>
        <View style={styles.logoLeft}>
          {logoSrc && (
            <Image style={styles.logo} src={logoSrc} />
          )}
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{settings.companyName}</Text>
          <Text>{settings.companyAddress}</Text>
          <Text>P.IVA: {settings.companyVat}</Text>
          <Text>{String(settings.companyEmail || '').replace(/\s*\n\s*/g, ' ')}</Text>
          <Text>{settings.companyPhone}</Text>
          {settings.bankInfo && (
             <Text style={{ marginTop: 2 }}>{settings.bankInfo}</Text>
          )}
          <Text style={[styles.quoteMeta, { marginTop: 4 }]}>
            N. {displayNumber} • Data: {safeFormatDate(quote.date, 'dd/MM/yyyy')}
          </Text>
        </View>
      </View>
      <View style={styles.separator} />
    </View>
    );
  };

  const renderRecipient = () => (
      <View style={styles.customerSection}>
        <Text style={styles.customerTitle}>DESTINATARIO</Text>
        <Text style={styles.customerName}>{quote.customerName}</Text>
        <Text>{quote.customerAddress}</Text>
        {quote.customerVat && <Text>P.IVA/CF: {quote.customerVat}</Text>}
      </View>
  );

  const renderFooter = () => (
    <View style={styles.footer} fixed>
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Text>Prev. N. {displayNumber} - </Text>
        <Text render={({ pageNumber, totalPages }) => `Pag. ${pageNumber} di ${totalPages}`} />
      </View>
    </View>
  );

  return (
  <Document>
    {attachmentsBefore && attachments.map((att, idx) => {
      const layout = att.layout || {};
      const pos = layout.imagePosition || 'top';
      const imgH = safeNumber(layout.imageHeight, 300);
      const descSize = safeNumber(layout.descriptionFontSize, 11);
      const descColor = layout.descriptionColor || '#333';
      const showTitle = layout.showTitle !== false;
      const imageEl = getValidImageSrc(att.imageData) ? <Image style={[styles.attachmentImage, { height: imgH }]} src={att.imageData!} /> : null;
      const descEl = att.description ? <Text style={[styles.attachmentText, { fontSize: descSize, color: descColor }]}>{att.description}</Text> : null;
      if (layout.fullPageImage && getValidImageSrc(att.imageData)) {
        return (
          <Page key={`att-top-${idx}`} size="A4" style={styles.fullImagePage}>
            {renderHeader()}
            {idx === 0 && <View style={{ paddingHorizontal: 30 }}>{renderRecipient()}</View>}
            <View style={styles.imageFillContainer}>
              <Image style={styles.fullImage} src={att.imageData!} />
            </View>
            {renderFooter()}
          </Page>
        );
      }
      return (
        <Page key={`att-top-${idx}`} size="A4" style={styles.attachmentPage}>
          {renderHeader()}
          {idx === 0 && renderRecipient()}
          {showTitle && att.title && <Text style={styles.attachmentTitle}>{att.title}</Text>}
          {pos === 'left' || pos === 'right' ? (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {pos === 'left' && <View style={{ width: '50%' }}>{imageEl}</View>}
              <View style={{ width: '50%' }}>{descEl}</View>
              {pos === 'right' && <View style={{ width: '50%' }}>{imageEl}</View>}
            </View>
          ) : (
            <>
              {pos === 'top' && imageEl}
              {descEl}
              {pos === 'bottom' && imageEl}
            </>
          )}
          {renderFooter()}
        </Page>
      );
    })}
    {/* Index Page + Premessa */}
    <Page size="A4" style={styles.page} id="indice">
      {renderHeader()}
      
      {/* Customer Section moved to first page logic */}
      {!attachmentsBefore && renderRecipient()}

      {quote.tocTextAbove && (
        <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 12 }}>{quote.tocTextAbove}</Text>
      )}
      {/* TOC / Index Content */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionTitle}>INDICE</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>
          • <Link src="#premessa">1. PREMESSA</Link>
        </Text>
        {(Array.isArray(quote.descrizioneProdottiImages) ? quote.descrizioneProdottiImages : []).filter(Boolean).length > 0 && (
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>
            • <Link src="#descrizione">2. DESCRIZIONE PRODOTTI</Link>
          </Text>
        )}
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>
          • <Link src="#offerta">3. OFFERTA ECONOMICA</Link>
        </Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>
          • <Link src="#condizioni">4. CONDIZIONI DI FORNITURA</Link>
        </Text>
      </View>
      {quote.tocText && (
        <Text style={{ fontSize: 11, color: '#4b5563' }}>{quote.tocText}</Text>
      )}

      {/* Premessa Section (Merged) */}
      <View style={{ marginTop: 10 }} id="premessa">
        <Text style={styles.sectionTitle}>1. PREMESSA</Text>
        {quote.premessaText && <Text style={styles.attachmentText}>{quote.premessaText}</Text>}
        <View style={{ marginTop: 10 }}>
          <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>HARDWARE</Text>
          {(() => {
            // Usa esclusivamente l'immagine e lo scaler dalle impostazioni globali
            const firstHw = getValidImageSrc(settings.defaultHardwareImage);
            const hwBaseHeight = safeNumber(settings.defaultHardwareHeight, 0);
            const hwScale = safePositive(settings.defaultHardwareScale, 100) / 100;
            const CONTENT_WIDTH = 530;
            const imgWidth = Math.min(hwScale * CONTENT_WIDTH, CONTENT_WIDTH);
            
            return firstHw && imgWidth > 0 ? (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <Image 
                  style={{ 
                    width: imgWidth,
                    height: hwBaseHeight ? hwBaseHeight * hwScale : undefined,
                    maxHeight: 520,
                    objectFit: 'contain' 
                  }} 
                  src={firstHw} 
                />
              </View>
            ) : null;
          })()}
        </View>
      </View>

      {renderFooter()}
    </Page>
    {/* Pagina Software + descrizione + Target Audience (stessa pagina, adattamento automatico) */}
    <Page size="A4" style={styles.attachmentPage}>
      {renderHeader()}
      
        <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 4 }]}>SOFTWARE</Text>
        {(() => {
          const softwareImages = Array.isArray(quote.softwareImages) ? quote.softwareImages : [];
          const firstSw = getValidImageSrc(softwareImages.filter(Boolean)[0] || settings.defaultSoftwareImage);
          const swBaseHeight = safeNumber(quote.softwareImageHeight ?? settings.defaultSoftwareHeight, 0);
          const swScale = safePositive(quote.softwareImageScale ?? settings.defaultSoftwareScale, 100) / 100;
          const CONTENT_WIDTH = 530; // Safer max width than 100%
          const imgWidth = Math.min(swScale * CONTENT_WIDTH, CONTENT_WIDTH);
          
          return firstSw && imgWidth > 0 ? (
            <View style={{ 
              width: '100%',
              alignItems: 'center',
              marginTop: 2,
              marginBottom: 6 
            }}>
              <Image 
                style={{ 
                  width: imgWidth,
                  height: swBaseHeight ? swBaseHeight * swScale : undefined,
                  objectFit: 'contain' 
                }} 
                src={firstSw} 
              />
            </View>
          ) : null;
        })()}
        <View style={{ marginTop: 6 }}>
          <Text style={[styles.attachmentText, { fontSize: 10, lineHeight: 1.35, textAlign: 'justify' }]}>
            {quote.softwareText || "Il nostro progetto è nato nel 2012 e, ad oggi, vantiamo numerose installazioni in tutta la regione. L'obiettivo dell'azienda, oltre quello di offrire alla propria clientela tutte le attrezzature e le soluzioni hardware e software necessarie per una corretta gestione della propria attività commerciale, è soprattutto quello di garantire l'assistenza post-vendita. A tal fine mette a disposizione dei propri Clienti una qualificata struttura di Assistenza Tecnica ed un efficientissimo servizio di Help Desk che garantiscono la pronta risoluzione di qualunque problematica sia Hardware che Software in tempi estremamente rapidi."}
          </Text>
        </View>
        {(() => {
          const targetAudienceImages = Array.isArray(quote.targetAudienceImages) ? quote.targetAudienceImages : [];
          const firstAud = getValidImageSrc(targetAudienceImages.filter(Boolean)[0] || settings.defaultTargetImage);
          const audBaseHeight = safeNumber(quote.targetAudienceImageHeight ?? settings.defaultTargetHeight, 0);
          const audScale = safePositive(quote.targetAudienceImageScale ?? settings.defaultTargetScale, 100) / 100;
          const CONTENT_WIDTH = 530;
          const imgWidth = Math.min(audScale * CONTENT_WIDTH, CONTENT_WIDTH);

          return firstAud && imgWidth > 0 ? (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 0 }]}>A CHI CI RIVOLGIAMO</Text>
              <View style={{ 
                width: '100%',
                alignItems: 'center', 
                marginTop: 0 
              }}>
                <Image 
                  style={{ 
                    width: imgWidth,
                    height: audBaseHeight ? audBaseHeight * audScale : undefined,
                    maxHeight: 520,
                    objectFit: 'contain' 
                  }} 
                  src={firstAud} 
                />
              </View>
            </View>
          ) : null;
        })()}
      
      {renderFooter()}
    </Page>

    {/* Sezione 2 - Descrizione Prodotti */}
    {(Array.isArray(quote.descrizioneProdottiImages) ? quote.descrizioneProdottiImages : []).map(getValidImageSrc).filter(Boolean).map((img, idx) => {
      const captions = Array.isArray(quote.descrizioneProdottiCaptions) ? quote.descrizioneProdottiCaptions : [];
      const scale = safePositive(quote.descrizioneProdottiFirstImageScale, 100) / 100;
      const CONTENT_WIDTH = 530;
      // Recalculate width for each image context if needed, but here we use the global scale setting
      const imgWidth = Math.min(scale * CONTENT_WIDTH, CONTENT_WIDTH);
      
      if (!img || imgWidth <= 0) return null;

      return (
        <Page key={`desc-prod-${idx}`} size="A4" style={styles.attachmentPage} id={idx === 0 ? "descrizione" : undefined}>
          {renderHeader(false)}
          <View style={{ width: '100%', alignItems: 'center' }}>
             {idx === 0 && <Text style={styles.sectionTitle}>2. DESCRIZIONE PRODOTTI</Text>}
             {captions[idx] && (
               <Text style={[styles.attachmentText, { marginBottom: 5, fontWeight: 'bold' }]}>{captions[idx]}</Text>
             )}
             <Image 
               style={{ width: imgWidth, maxHeight: 520, objectFit: 'contain' }} 
               src={img} 
             />
          </View>
          {renderFooter()}
        </Page>
      );
    })}

    {/* Economic Offer: main quote page */}
    <Page size="A4" style={styles.page} id="offerta">
      {renderHeader()}
      <Text style={styles.sectionTitle}>3. OFFERTA ECONOMICA</Text>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colCode}>CODICE</Text>
          <Text style={styles.colDesc}>DESCRIZIONE</Text>
          <Text style={styles.colQty}>Q.TÀ</Text>
          <Text style={styles.colPrice}>PREZZO</Text>
          <Text style={styles.colTotal}>TOTALE</Text>
        </View>
        {(Array.isArray(quote.items) ? quote.items : []).map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.colCode}>{item.code || ''}</Text>
            <Text style={styles.colDesc}>{item.description || ''}</Text>
            <Text style={styles.colQty}>{item.quantity || 0}</Text>
            <Text style={styles.colPrice}>€ {safeNumber(item.unitPrice, 0).toFixed(2)}</Text>
            <Text style={styles.colTotal}>€ {safeNumber(item.total, 0).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Block 1: Totals and Leasing */}
      <View>
        {/* Totals */}
        {quote.showTotals !== false && (
            <View style={styles.totalsSection}>
            <View style={styles.totalsBox}>
                <View style={styles.totalRow}>
                <Text>Imponibile</Text>
                <Text>€ {safeNumber(quote.subtotal, 0).toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                <Text>IVA</Text>
                <Text>€ {safeNumber(quote.vatTotal, 0).toFixed(2)}</Text>
                </View>
                <View style={styles.grandTotal}>
                <Text>TOTALE</Text>
                <Text>€ {safeNumber(quote.total, 0).toFixed(2)}</Text>
                </View>
            </View>
            </View>
        )}

        {/* Leasing Section */}
        {quote.leasing && (
            <View style={styles.leasingContainer}>
            <View style={styles.leasingHeaderBox}>
                <Text style={styles.leasingTitle}>
                {quote.leasing.type === 'financing' ? 'PIANO FINANZIAMENTO' : 'PIANO LEASING'}
                </Text>
            </View>
            <View style={styles.leasingBody}>
                <View style={styles.leasingColumns}>
                {/* Column 1 */}
                <View style={styles.leasingCol}>
                    {/* 1) Parametri economici */}
                    <Text style={styles.leasingGroupTitle}>Parametri Economici</Text>
                    {quote.leasing.assetValue !== undefined && (
                    <View style={styles.leasingRow}>
                        <Text style={styles.leasingLabel}>Importo Bene:</Text>
                        <Text style={styles.leasingValue}>€ {safeNumber(quote.leasing.assetValue, 0).toFixed(2)}</Text>
                    </View>
                    )}
                    {quote.leasing.vatAmount !== undefined && (
                    <View style={styles.leasingRow}>
                        <Text style={styles.leasingLabel}>IVA {quote.leasing.vatRate ? `(${quote.leasing.vatRate}%)` : ''}:</Text>
                        <Text style={styles.leasingValue}>€ {safeNumber(quote.leasing.vatAmount, 0).toFixed(2)}</Text>
                    </View>
                    )}
                    {quote.leasing.totalAssetValueVatIncl !== undefined && (
                    <View style={styles.leasingRow}>
                        <Text style={styles.leasingLabel}>Totale IVA Incl.:</Text>
                        <Text style={styles.leasingValue}>€ {safeNumber(quote.leasing.totalAssetValueVatIncl, 0).toFixed(2)}</Text>
                    </View>
                    )}
                    {quote.leasing.initialDownPaymentValue !== undefined && (
                    <View style={styles.leasingRow}>
                        <Text style={styles.leasingLabel}>Anticipo:</Text>
                        <Text style={styles.leasingValue}>€ {safeNumber(quote.leasing.initialDownPaymentValue, 0).toFixed(2)}</Text>
                    </View>
                    )}
                    {quote.leasing.netFinancedCapital !== undefined && (
                    <View style={styles.leasingRow}>
                        <Text style={styles.leasingLabel}>Capitale Finanziato:</Text>
                        <Text style={styles.leasingValue}>€ {safeNumber(quote.leasing.netFinancedCapital, 0).toFixed(2)}</Text>
                    </View>
                    )}
                </View>

                {/* Column 2 */}
                <View style={styles.leasingCol}>
                    {/* 2) Durata */}
                    <Text style={styles.leasingGroupTitle}>Durata e Canoni</Text>
                    {quote.leasing.durationMonths !== undefined && (
                    <View style={styles.leasingRow}>
                        <Text style={styles.leasingLabel}>Durata:</Text>
                        <Text style={styles.leasingValue}>{quote.leasing.durationMonths} Mesi</Text>
                    </View>
                    )}
                    {quote.leasing.numberOfInstallments !== undefined && (
                    <View style={styles.leasingRow}>
                        <Text style={styles.leasingLabel}>N. Canoni:</Text>
                        <Text style={styles.leasingValue}>{quote.leasing.numberOfInstallments}</Text>
                    </View>
                    )}
                    {quote.leasing.installmentAmount !== undefined && (
                    <View style={styles.leasingRow}>
                        <Text style={styles.leasingLabel}>Canone Periodico:</Text>
                        <Text style={styles.leasingValue}>€ {safeNumber(quote.leasing.installmentAmount, 0).toFixed(2)}</Text>
                    </View>
                    )}
                    {quote.leasing.periodicity && (
                    <View style={styles.leasingRow}>
                        <Text style={styles.leasingLabel}>Periodicità:</Text>
                        <Text style={styles.leasingValue}>
                        {quote.leasing.periodicity === 'monthly' ? 'Mensile' : 'Trimestrale'}
                        </Text>
                    </View>
                    )}
                    {quote.leasing.startDate && (
                        <View style={styles.leasingRow}>
                            <Text style={styles.leasingLabel}>Decorrenza:</Text>
                            <Text style={styles.leasingValue}>{safeFormatDate(quote.leasing.startDate, 'dd/MM/yyyy')}</Text>
                        </View>
                    )}
                </View>
                </View>
            </View>
            </View>
        )}
      </View>

      {/* Block 2: Conditions, Date, Signatures */}
      <View style={{ marginTop: 20 }}>
        {/* Conditions inline */}
        {(quote.conditionsList && quote.conditionsList.length > 0) && (
            <View id="condizioni" style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>4. CONDIZIONI DI FORNITURA</Text>
            <View>
                {(quote.conditionsList || []).filter(Boolean).map((cond, idx) => (
                <View key={`cond-inline-${idx}`} style={{ flexDirection: 'row', marginBottom: 6 }}>
                    <Text style={{ marginRight: 6 }}>•</Text>
                    <Text style={styles.attachmentText}>{cond}</Text>
                </View>
                ))}
            </View>
            </View>
        )}

        <Text style={{ fontSize: 11 }}>San Giovanni la Punta, {safeFormatDate(quote.date, 'dd/MM/yyyy')}</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
            {/* Left: Admin Signature */}
            <View style={{ alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 11, marginBottom: quote.adminSignature ? 5 : 50 }}>L'Amministratore</Text>
            {quote.adminSignature ? (
                <Image 
                src={quote.adminSignature} 
                style={{ 
                    width: 150 * (safeNumber(quote.adminSignatureScale, 100) / 100),
                    marginBottom: 5
                }} 
                />
            ) : null}
            <View style={{ width: 200, borderBottomWidth: 1, borderBottomColor: '#000' }} />
            </View>

            {/* Right: Customer Signature */}
            <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, marginBottom: 50 }}>Firma per accettazione</Text>
            <View style={{ width: 200, borderBottomWidth: 1, borderBottomColor: '#000' }} />
            </View>
        </View>
      </View>

      {/* Footer */}
      {renderFooter()}
    </Page>
    
    
    {/* Attachments with customizable layout */}
    {!attachmentsBefore && attachments.map((att, idx) => {
      const layout = att.layout || {};
      const pos = layout.imagePosition || 'top';
      const imgH = safeNumber(layout.imageHeight, 300);
      const descSize = safeNumber(layout.descriptionFontSize, 11);
      const descColor = layout.descriptionColor || '#333';
      const showTitle = layout.showTitle !== false;

      const imageEl = getValidImageSrc(att.imageData) ? <Image style={[styles.attachmentImage, { height: imgH }]} src={att.imageData!} /> : null;
      const descEl = att.description ? <Text style={[styles.attachmentText, { fontSize: descSize, color: descColor }]}>{att.description}</Text> : null;

      if (layout.fullPageImage && getValidImageSrc(att.imageData)) {
        return (
          <Page key={`att-${idx}`} size="A4" style={styles.fullImagePage}>
            {renderHeader()}
            <View style={styles.imageFillContainer}>
              <Image style={styles.fullImage} src={att.imageData!} />
            </View>
          </Page>
        );
      } else {
        return (
          <Page key={`att-${idx}`} size="A4" style={styles.attachmentPage}>
            {renderHeader()}
            {showTitle && att.title && <Text style={styles.attachmentTitle}>{att.title}</Text>}
            {pos === 'left' || pos === 'right' ? (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {pos === 'left' && (
                  <View style={{ width: '50%' }}>
                    {imageEl}
                  </View>
                )}
                <View style={{ width: '50%' }}>
                  {descEl}
                </View>
                {pos === 'right' && (
                  <View style={{ width: '50%' }}>
                    {imageEl}
                  </View>
                )}
              </View>
            ) : (
              <>
                {pos === 'top' && imageEl}
                {descEl}
                {pos === 'bottom' && imageEl}
              </>
            )}
          </Page>
        );
      }
    })}

    {/* Contract Pages at end */}
    {contractPages.map((pageText, idx) => (
      <Page key={`contract-${idx}`} size="A4" style={styles.contractPage}>
        {renderHeader()}
        <Text style={styles.contractText}>{pageText}</Text>
        {renderFooter()}
      </Page>
    ))}
  </Document>
)};

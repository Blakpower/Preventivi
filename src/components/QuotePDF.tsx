import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { type Quote, type Settings } from '../db';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 10,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
  },
  logoLeft: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb', // blue-600
    marginBottom: 5,
  },
  quoteMeta: {
    fontSize: 10,
    color: '#666',
  },
  companyInfo: {
    width: '55%',
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  customerSection: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#1e3a8a', // Dark blue
    padding: 15,
    borderRadius: 4,
    color: '#ffffff',
  },
  customerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#ffffff',
  },
  customerName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#ffffff',
  },
  table: {
    width: '100%',
    marginBottom: 20,
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
    marginTop: 20,
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
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  bankInfo: {
    marginTop: 40,
    padding: 10,
    backgroundColor: '#1e3a8a', // Dark blue
    borderRadius: 4,
    fontSize: 9,
    color: '#ffffff',
  },
  attachmentPage: {
    padding: 30,
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
    marginBottom: 12,
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
    marginTop: 20,
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
  }
});

interface QuotePDFProps {
  quote: Quote;
  settings: Settings;
}

export const QuotePDF: React.FC<QuotePDFProps> = ({ quote, settings }) => {
  const contractPages = (settings.contractPagesText || '').split('---').map(p => p.trim()).filter(Boolean);
  const displayNumber = quote.number && String(quote.number).trim() ? quote.number : `${settings.quoteNumberPrefix}${settings.nextQuoteNumber}`;
  const attachments = quote.attachments || [];
  const attachmentsBefore = (quote.attachmentsPosition || 'after') === 'before';
  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.logoLeft}>
          {(settings.logoData || settings.logoUrl) && (
            <Image style={styles.logo} src={settings.logoData || settings.logoUrl!} />
          )}
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{settings.companyName}</Text>
          <Text>{settings.companyAddress}</Text>
          <Text>P.IVA: {settings.companyVat}</Text>
          <Text>{settings.companyEmail}</Text>
          <Text>{settings.companyPhone}</Text>
          <Text style={styles.quoteMeta}>N. {displayNumber} • Data: {format(quote.date, 'dd/MM/yyyy')}</Text>
        </View>
      </View>
      <View style={styles.separator} />
    </>
  );

  const renderFooter = () => (
    <View style={styles.footer} fixed>
      <Text>Esse Group S.r.l. - Via Aurora, 4 - 95037 San Giovanni La Punta (CT) - P.IVA 04944360876</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}>
        <Text>Prev. N. {displayNumber} - </Text>
        <Text render={({ pageNumber, totalPages }) => `Pag. ${pageNumber} di ${totalPages}`} />
      </View>
    </View>
  );

  return (
  <Document>
    {attachmentsBefore && attachments.map(/* render each */ (att, idx) => {
      const layout = att.layout || {};
      const pos = layout.imagePosition || 'top';
      const imgH = layout.imageHeight || 300;
      const descSize = layout.descriptionFontSize || 11;
      const descColor = layout.descriptionColor || '#333';
      const showTitle = layout.showTitle !== false;
      const imageEl = att.imageData ? <Image style={[styles.attachmentImage, { height: imgH }]} src={att.imageData} /> : null;
      const descEl = att.description ? <Text style={[styles.attachmentText, { fontSize: descSize, color: descColor }]}>{att.description}</Text> : null;
      if (layout.fullPageImage && att.imageData) {
        return (
          <Page key={`att-top-${idx}`} size="A4" style={styles.fullImagePage}>
            {renderHeader()}
            <View style={styles.imageFillContainer}>
              <Image style={styles.fullImage} src={att.imageData} />
            </View>
            {renderFooter()}
          </Page>
        );
      }
      return (
        <Page key={`att-top-${idx}`} size="A4" style={styles.attachmentPage}>
          {renderHeader()}
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
    {/* Index Page */}
    <Page size="A4" style={styles.page} id="indice">
      {renderHeader()}
      {quote.tocTextAbove && (
        <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 12 }}>{quote.tocTextAbove}</Text>
      )}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Indice</Text>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
          • <Link src="#premessa">1. Premessa</Link>
        </Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
          • <Link src="#descrizione">2. Descrizione prodotti</Link>
        </Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
          • <Link src="#offerta">3. Offerta economica</Link>
        </Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
          • <Link src="#condizioni">4. Condizioni di fornitura</Link>
        </Text>
      </View>
      {quote.tocText && (
        <Text style={{ fontSize: 11, color: '#4b5563' }}>{quote.tocText}</Text>
      )}
      {renderFooter()}
    </Page>

    {/* Premessa Page - Hardware + Software + Target Audience */}
    <Page size="A4" style={styles.attachmentPage} id="premessa">
      {renderHeader()}
      <Text style={styles.attachmentTitle}>1. Premessa</Text>
      {quote.premessaText && <Text style={styles.attachmentText}>{quote.premessaText}</Text>}
      <View style={{ marginTop: 12 }}>
        <Text style={[styles.attachmentTitle, { textAlign: 'center' }]}>Hardware</Text>
        {(() => {
          const firstHw = (quote.premessaHardwareImages || []).filter(Boolean)[0];
          return firstHw ? (
            <Image style={{ width: '100%', height: settings.defaultHardwareHeight ?? 380, objectFit: 'contain' }} src={firstHw} />
          ) : null;
        })()}
      </View>
      {renderFooter()}
    </Page>
    {/* Pagina Software + descrizione + Target Audience (stessa pagina, adattamento automatico) */}
    <Page size="A4" style={styles.attachmentPage}>
      {renderHeader()}
      
        <Text style={[styles.attachmentTitle, { textAlign: 'center', marginBottom: 4 }]}>Software</Text>
        {(() => {
          const firstSw = (quote.softwareImages || []).filter(Boolean)[0];
          const swBaseHeight = Number(quote.softwareImageHeight ?? settings.defaultSoftwareHeight ?? 180);
          const swScale = Number(quote.softwareImageScale ?? 100) / 100;
          const CONTENT_WIDTH = 530; // Safer max width than 100%
          
          return firstSw ? (
            <View style={{ 
              width: '100%',
              alignItems: 'center',
              marginTop: 2,
              marginBottom: 6 
            }}>
              <Image 
                style={{ 
                  width: Math.min(swScale * CONTENT_WIDTH, CONTENT_WIDTH),
                  height: swBaseHeight * swScale,
                  objectFit: 'contain' 
                }} 
                src={firstSw} 
              />
            </View>
          ) : null;
        })()}
        <View style={{ marginTop: 6 }}>
          <Text style={[styles.attachmentText, { fontSize: 10, lineHeight: 1.35 }]}>
            {quote.softwareText || "Il nostro progetto è nato nel 2012 e, ad oggi, vantiamo numerose installazioni in tutta la regione. L'obiettivo dell'azienda, oltre quello di offrire alla propria clientela tutte le attrezzature e le soluzioni hardware e software necessarie per una corretta gestione della propria attività commerciale, è soprattutto quello di garantire l'assistenza post-vendita. A tal fine mette a disposizione dei propri Clienti una qualificata struttura di Assistenza Tecnica ed un efficientissimo servizio di Help Desk che garantiscono la pronta risoluzione di qualunque problematica sia Hardware che Software in tempi estremamente rapidi."}
          </Text>
        </View>
        {(() => {
          const firstAud = (quote.targetAudienceImages || []).filter(Boolean)[0];
          const audBaseHeight = Number(quote.targetAudienceImageHeight ?? settings.defaultTargetHeight ?? 180);
          const audScale = Number(quote.targetAudienceImageScale ?? 100) / 100;
          const CONTENT_WIDTH = 530;

          return firstAud ? (
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.attachmentTitle, { textAlign: 'center', marginBottom: 0 }]}>A chi ci rivolgiamo</Text>
              <View style={{ 
                width: '100%',
                alignItems: 'center', 
                marginTop: 0 
              }}>
                <Image 
                  style={{ 
                    width: Math.min(audScale * CONTENT_WIDTH, CONTENT_WIDTH),
                    height: audBaseHeight * audScale,
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

    {/* Sezione 2 - Descrizione Prodotti con prima immagine nella stessa pagina */}
    {(() => {
      const imgs = (quote.descrizioneProdottiImages || []).filter(Boolean);
      const pages: React.ReactElement[] = [];
      // Intro page with section title, text and first image filling the remaining area (senza crop)
      pages.push(
        <Page key="desc-prod-intro" size="A4" style={styles.attachmentPage} id="descrizione">
          {renderHeader()}
          <Text style={styles.attachmentTitle}>2. Descrizione Prodotti</Text>
          {quote.descrizioneProdottiText && <Text style={styles.attachmentText}>{quote.descrizioneProdottiText}</Text>}
          {imgs[0] && (
            <View style={{ 
              width: '100%',
              alignItems: 'center',
              marginTop: 10 
            }}>
              <Image 
                style={{ 
                  width: Math.min(Number(quote.descrizioneProdottiFirstImageScale ?? 100) / 100 * 530, 530),
                  height: Math.max(100, Math.round((300 * Number(quote.descrizioneProdottiFirstImageScale ?? 100)) / 100)),
                  objectFit: 'contain' 
                }} 
                src={imgs[0]!} 
              />
            </View>
          )}
          {renderFooter()}
        </Page>
      );
      // Full-page image pages for remaining images
      imgs.slice(1).forEach((img, idx) => {
        pages.push(
          <Page key={`desc-prod-full-${idx}`} size="A4" style={styles.fullImagePage}>
            {renderHeader()}
            <View style={styles.imageFillContainer}>
              <Image style={[styles.fullImage, { objectFit: quote.descrizioneProdottiImageFit || 'contain' }]} src={img!} />
            </View>
            {renderFooter()}
          </Page>
        );
      });
      return pages;
    })()}

    {/* Economic Offer: main quote page */}
    <Page size="A4" style={styles.page} id="offerta">
      {renderHeader()}
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>3. Offerta economica</Text>

      {/* Customer */}
      <View style={styles.customerSection}>
        <Text style={styles.customerTitle}>DESTINATARIO</Text>
        <Text style={styles.customerName}>{quote.customerName}</Text>
        <Text style={{ color: '#ffffff' }}>{quote.customerAddress}</Text>
        {quote.customerVat && <Text style={{ color: '#ffffff' }}>P.IVA/CF: {quote.customerVat}</Text>}
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colCode}>CODICE</Text>
          <Text style={styles.colDesc}>DESCRIZIONE</Text>
          <Text style={styles.colQty}>Q.TÀ</Text>
          <Text style={styles.colPrice}>PREZZO</Text>
          <Text style={styles.colTotal}>TOTALE</Text>
        </View>
        {quote.items.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.colCode}>{item.code}</Text>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>€ {item.unitPrice.toFixed(2)}</Text>
            <Text style={styles.colTotal}>€ {item.total.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text>Imponibile</Text>
            <Text>€ {quote.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>IVA</Text>
            <Text>€ {quote.vatTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTALE</Text>
            <Text>€ {quote.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Leasing Section */}
      {quote.leasing && (
        <View style={styles.leasingContainer} wrap={false}>
          <View style={styles.leasingHeaderBox}>
            <Text style={styles.leasingTitle}>PIANO LEASING</Text>
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
                    <Text style={styles.leasingValue}>€ {Number(quote.leasing.assetValue).toFixed(2)}</Text>
                  </View>
                )}
                {quote.leasing.vatAmount !== undefined && (
                  <View style={styles.leasingRow}>
                    <Text style={styles.leasingLabel}>IVA {quote.leasing.vatRate ? `(${quote.leasing.vatRate}%)` : ''}:</Text>
                    <Text style={styles.leasingValue}>€ {Number(quote.leasing.vatAmount).toFixed(2)}</Text>
                  </View>
                )}
                {quote.leasing.totalAssetValueVatIncl !== undefined && (
                  <View style={styles.leasingRow}>
                    <Text style={styles.leasingLabel}>Totale IVA Incl.:</Text>
                    <Text style={styles.leasingValue}>€ {Number(quote.leasing.totalAssetValueVatIncl).toFixed(2)}</Text>
                  </View>
                )}
                {quote.leasing.initialDownPaymentValue !== undefined && (
                  <View style={styles.leasingRow}>
                    <Text style={styles.leasingLabel}>Anticipo:</Text>
                    <Text style={styles.leasingValue}>€ {Number(quote.leasing.initialDownPaymentValue).toFixed(2)}</Text>
                  </View>
                )}
                {quote.leasing.netFinancedCapital !== undefined && (
                  <View style={styles.leasingRow}>
                    <Text style={styles.leasingLabel}>Capitale Finanziato:</Text>
                    <Text style={styles.leasingValue}>€ {Number(quote.leasing.netFinancedCapital).toFixed(2)}</Text>
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
                    <Text style={styles.leasingValue}>€ {Number(quote.leasing.installmentAmount).toFixed(2)}</Text>
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
                        <Text style={styles.leasingValue}>{format(new Date(quote.leasing.startDate), 'dd/MM/yyyy')}</Text>
                    </View>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Bank Info */}
      {settings.bankInfo && (
        <View style={styles.bankInfo}>
          <Text style={{ fontWeight: 'bold', marginBottom: 2, color: '#ffffff' }}>Coordinate Bancarie:</Text>
          <Text style={{ color: '#ffffff' }}>{settings.bankInfo}</Text>
        </View>
      )}
      {/* Conditions inline below economic offer */}
      {(quote.conditionsList && quote.conditionsList.length > 0) && (
        <View style={{ marginTop: 16 }} id="condizioni">
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>4. Condizioni di fornitura</Text>
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

      <View style={{ marginTop: 30 }}>
        <Text style={{ fontSize: 11 }}>San Giovanni la Punta, {format(quote.date, 'dd/MM/yyyy')}</Text>
        <View style={{ marginTop: 20, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 11, marginBottom: 30 }}>Firma per accettazione</Text>
          <View style={{ width: 200, borderBottomWidth: 1, borderBottomColor: '#000' }} />
        </View>
      </View>

      {/* Footer */}
      {renderFooter()}
    </Page>
    
    
    {/* Attachments with customizable layout */}
    {!attachmentsBefore && attachments.map((att, idx) => {
      const layout = att.layout || {};
      const pos = layout.imagePosition || 'top';
      const imgH = layout.imageHeight || 300;
      const descSize = layout.descriptionFontSize || 11;
      const descColor = layout.descriptionColor || '#333';
      const showTitle = layout.showTitle !== false;

      const imageEl = att.imageData ? <Image style={[styles.attachmentImage, { height: imgH }]} src={att.imageData} /> : null;
      const descEl = att.description ? <Text style={[styles.attachmentText, { fontSize: descSize, color: descColor }]}>{att.description}</Text> : null;

      if (layout.fullPageImage && att.imageData) {
        return (
          <Page key={`att-${idx}`} size="A4" style={styles.fullImagePage}>
            {renderHeader()}
            <View style={styles.imageFillContainer}>
              <Image style={styles.fullImage} src={att.imageData} />
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

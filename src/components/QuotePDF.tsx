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
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 4,
  },
  customerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#6b7280',
  },
  customerName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
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
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    fontSize: 9,
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
    </Page>
    {/* Pagina Software + descrizione + Target Audience (stessa pagina, adattamento automatico) */}
    <Page size="A4" style={styles.attachmentPage}>
      {renderHeader()}
      <View style={{ flexGrow: 1 }}>
        <Text style={[styles.attachmentTitle, { textAlign: 'center' }]}>Software</Text>
        {(() => {
          const firstSw = (quote.softwareImages || []).filter(Boolean)[0];
          return firstSw ? (
            <View style={{ height: settings.defaultSoftwareHeight ?? 180, marginBottom: 6 }}>
              <Image style={{ width: '100%', height: '100%', objectFit: 'contain' }} src={firstSw} />
            </View>
          ) : null;
        })()}
        <Text style={[styles.attachmentText, { marginTop: 6, fontSize: 10, lineHeight: 1.35 }]}>
          {quote.softwareText || "Il nostro progetto è nato nel 2012 e, ad oggi, vantiamo numerose installazioni in tutta la regione. L'obiettivo dell'azienda, oltre quello di offrire alla propria clientela tutte le attrezzature e le soluzioni hardware e software necessarie per una corretta gestione della propria attività commerciale, è soprattutto quello di garantire l'assistenza post-vendita. A tal fine mette a disposizione dei propri Clienti una qualificata struttura di Assistenza Tecnica ed un efficientissimo servizio di Help Desk che garantiscono la pronta risoluzione di qualunque problematica sia Hardware che Software in tempi estremamente rapidi."}
        </Text>
        {(() => {
          const firstAud = (quote.targetAudienceImages || []).filter(Boolean)[0];
          return firstAud ? (
            <>
              <Text style={[styles.attachmentTitle, { marginTop: 10, textAlign: 'center' }]}>A chi ci rivolgiamo</Text>
              <View style={{ height: settings.defaultTargetHeight ?? 180, marginTop: 6 }}>
                <Image style={{ width: '100%', height: '100%', objectFit: 'contain' }} src={firstAud} />
              </View>
            </>
          ) : null;
        })()}
      </View>
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
            <View style={{ height: settings.defaultDescrizioneFirstHeight ?? 300, marginTop: 10 }}>
              <Image style={{ width: '100%', height: '100%', objectFit: 'contain' }} src={imgs[0]!} />
            </View>
          )}
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
        <Text>{quote.customerAddress}</Text>
        {quote.customerVat && <Text>P.IVA/CF: {quote.customerVat}</Text>}
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

      {/* Bank Info */}
      {settings.bankInfo && (
        <View style={styles.bankInfo}>
          <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Coordinate Bancarie:</Text>
          <Text>{settings.bankInfo}</Text>
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

      {/* Footer */}
      <Text style={styles.footer}>
        {settings.companyName} - {settings.companyAddress} - P.IVA {settings.companyVat}
      </Text>
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
      </Page>
    ))}
  </Document>
)};

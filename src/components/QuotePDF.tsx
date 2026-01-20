import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { type Quote, type Settings } from '../db';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
  },
  titleSection: {
    alignItems: 'flex-end',
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
    width: '45%',
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
    padding: 40,
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
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{settings.companyName}</Text>
          <Text>{settings.companyAddress}</Text>
          <Text>P.IVA: {settings.companyVat}</Text>
          <Text>{settings.companyEmail}</Text>
          <Text>{settings.companyPhone}</Text>
        </View>
        <View style={styles.titleSection}>
          {(settings.logoData || settings.logoUrl) && (
            <Image style={styles.logo} src={settings.logoData || settings.logoUrl!} />
          )}
          <Text style={styles.quoteMeta}>N. {displayNumber}</Text>
          <Text style={styles.quoteMeta}>Data: {format(quote.date, 'dd/MM/yyyy')}</Text>
        </View>
      </View>

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

      {/* Footer */}
      <Text style={styles.footer}>
        {settings.companyName} - {settings.companyAddress} - P.IVA {settings.companyVat}
      </Text>
    </Page>
    
    {/* Attachments with customizable layout */}
    {(quote.attachments || []).map((att, idx) => {
      const layout = att.layout || {};
      const pos = layout.imagePosition || 'top';
      const imgH = layout.imageHeight || 300;
      const descSize = layout.descriptionFontSize || 11;
      const descColor = layout.descriptionColor || '#333';
      const showTitle = layout.showTitle !== false;

      const imageEl = att.imageData ? <Image style={[styles.attachmentImage, { height: imgH }]} src={att.imageData} /> : null;
      const descEl = att.description ? <Text style={[styles.attachmentText, { fontSize: descSize, color: descColor }]}>{att.description}</Text> : null;

      return (
        <Page key={`att-${idx}`} size="A4" style={styles.attachmentPage}>
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
    })}

    {/* Contract Pages at end */}
    {contractPages.map((pageText, idx) => (
      <Page key={`contract-${idx}`} size="A4" style={styles.contractPage}>
        <Text style={styles.contractText}>{pageText}</Text>
      </Page>
    ))}
  </Document>
)};

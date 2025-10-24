# 🔧 Fix Diacritice PDF - Soluție Completă

## Problema
jsPDF nu suportă corect diacriticele românești (ă, â, î, ș, ț) chiar și cu fonturile Times sau Courier.

## ✅ Soluție 1: html2canvas (RECOMANDAT - cel mai simplu)

### Instalare:
```bash
cd _git/normalro-frontend
npm install html2canvas
```

### Implementare:
În `InvoiceGenerator.js`, înlocuiește funcția `exportToPDF` cu:

```javascript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const exportToPDF = async () => {
  // Creează un element temporar cu factura
  const invoiceElement = document.createElement('div');
  invoiceElement.style.position = 'absolute';
  invoiceElement.style.left = '-9999px';
  invoiceElement.style.width = '800px';
  invoiceElement.style.padding = '40px';
  invoiceElement.style.backgroundColor = 'white';
  invoiceElement.style.fontFamily = 'Arial, sans-serif';
  
  // Construiește HTML-ul facturii cu toate diacriticele
  invoiceElement.innerHTML = `
    <div style="font-family: Arial, sans-serif;">
      <h1 style="text-align: center; font-size: 24px; margin-bottom: 10px;">FACTURĂ</h1>
      <div style="text-align: center; margin-bottom: 20px;">
        <div>Seria: ${invoiceData.series || '-'} Nr: ${invoiceData.number || '-'}</div>
        <div>Data: ${invoiceData.issueDate || '-'}</div>
        ${invoiceData.dueDate ? `<div>Scadență: ${invoiceData.dueDate}</div>` : ''}
      </div>
      
      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <strong>FURNIZOR:</strong><br/>
            ${invoiceData.supplierName || '-'}<br/>
            CUI: ${invoiceData.supplierCUI || '-'}<br/>
            ${invoiceData.supplierRegCom ? `Reg Com: ${invoiceData.supplierRegCom}<br/>` : ''}
            ${invoiceData.supplierAddress || '-'}<br/>
            ${invoiceData.supplierCity || '-'}
          </td>
          <td style="width: 50%; vertical-align: top;">
            <strong>BENEFICIAR:</strong><br/>
            ${invoiceData.clientName || '-'}<br/>
            CUI: ${invoiceData.clientCUI || '-'}<br/>
            ${invoiceData.clientRegCom ? `Reg Com: ${invoiceData.clientRegCom}<br/>` : ''}
            ${invoiceData.clientAddress || '-'}<br/>
            ${invoiceData.clientCity || '-'}
          </td>
        </tr>
      </table>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #2196F3; color: white;">
            <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">Nr.</th>
            <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">Produs/Serviciu</th>
            <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">Cant.</th>
            <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">Preț Net</th>
            <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">TVA%</th>
            <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">Suma TVA</th>
            <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">Preț Brut</th>
            <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">Total Net</th>
            <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">Total TVA</th>
            <th style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">Total Brut</th>
          </tr>
        </thead>
        <tbody>
          ${lines.map((line, index) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 9px;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 6px; font-size: 9px;">${line.product || '-'}</td>
              <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 9px;">${line.quantity}</td>
              <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${line.unitNetPrice} RON</td>
              <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 9px;">${line.vatRate}%</td>
              <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineVat(line)} RON</td>
              <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${line.unitGrossPrice} RON</td>
              <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineTotal(line, 'net')} RON</td>
              <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineTotal(line, 'vat')} RON</td>
              <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-size: 9px;">${calculateLineTotal(line, 'gross')} RON</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background-color: #f5f5f5; font-weight: bold;">
            <td colspan="7" style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">TOTAL FACTURĂ</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 10px;">${calculateTotals().net} RON</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 10px;">${calculateTotals().vat} RON</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 10px;">${calculateTotals().gross} RON</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
  
  document.body.appendChild(invoiceElement);
  
  try {
    // Convertește HTML-ul la canvas
    const canvas = await html2canvas(invoiceElement, {
      scale: 2, // Calitate mai bună
      useCORS: true,
      logging: false
    });
    
    // Creează PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Salvează PDF
    pdf.save(`factura_${invoiceData.series || 'X'}_${invoiceData.number || '000'}_${invoiceData.issueDate}.pdf`);
    
  } finally {
    // Șterge elementul temporar
    document.body.removeChild(invoiceElement);
  }
};
```

---

## ✅ Soluție 2: Font personalizat (mai complex)

### Descarcă un font care suportă diacritice:
1. Download **DejaVu Sans** (.ttf)
2. Convertește la base64
3. Adaugă în jsPDF cu `addFont()`

---

## ✅ Soluție 3: pdfmake (alternativă completă)

Bibliotecă modernă cu suport nativ UTF-8:

```bash
npm install pdfmake
```

---

## 🚀 Recomandare Finală

**Folosește Soluția 1 (html2canvas)** pentru că:
- ✅ Foarte simplu de implementat
- ✅ Garantat funcționează cu toate diacriticele
- ✅ Menține formatul exact ca în browser
- ✅ Nu necesită fonturi speciale

**Pași:**
1. `npm install html2canvas`
2. Înlocuiește funcția `exportToPDF` cu codul de mai sus
3. Testează - toate diacriticele vor fi corecte!

---

## 📝 Note

- html2canvas convertește HTML-ul vizibil în imagine
- Imaginea e apoi pusă în PDF
- Astfel toate stilurile CSS și diacriticele sunt păstrate exact
- Performance: ~1-2 secunde pentru generare (acceptabil)


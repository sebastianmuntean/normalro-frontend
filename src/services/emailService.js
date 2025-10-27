import API_BASE_URL from '../config/api';

/**
 * Serviciu pentru trimitere automată de emailuri cu facturi
 * Folosește credențialele utilizatorului (NU ale serverului) pentru securitate
 */
class EmailService {
  /**
   * Verifică providerii disponibili (configurați pe backend)
   */
  async getAvailableProviders() {
    try {
      const response = await fetch(`${API_BASE_URL}/email/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Eroare verificare configurație email');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Eroare verificare provideri email:', error);
      return { success: false, providers: [], hasAnyProvider: false };
    }
  }

  /**
   * Uploadează PDF-ul pe server temporar
   * @param {Blob} pdfBlob - Blob-ul PDF-ului
   * @param {string} filename - Numele fișierului
   */
  async uploadTempFile(pdfBlob, filename) {
    try {
      // Convertește Blob în Base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result.split(',')[1]; // Elimină prefixul "data:..."
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      const fileBase64 = await base64Promise;

      // Trimite către backend
      const response = await fetch(`${API_BASE_URL}/email/upload-temp-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileBase64,
          filename
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Eroare upload fișier');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Eroare upload fișier temporar:', error);
      throw error;
    }
  }

  /**
   * Trimite email cu PDF atașat
   * @param {Object} emailData - Datele email-ului (inclusiv credențiale utilizator)
   */
  async sendEmail(emailData) {
    try {
      const {
        provider,
        to,
        subject,
        body,
        fileId,
        filename,
        fromName,
        userEmail,
        userPassword,
        smtpHost,
        smtpPort
      } = emailData;

      const response = await fetch(`${API_BASE_URL}/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider,
          to,
          subject,
          body,
          fileId,
          filename,
          fromName,
          // CREDENȚIALE UTILIZATOR (trimise prin HTTPS, nu salvate pe server)
          userEmail,
          userPassword,
          smtpHost,
          smtpPort
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Eroare trimitere email');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Eroare trimitere email:', error);
      throw error;
    }
  }

  /**
   * Șterge fișierul temporar de pe server
   * @param {string} fileId - ID-ul fișierului
   */
  async deleteTempFile(fileId) {
    try {
      const response = await fetch(`${API_BASE_URL}/email/delete-temp-file/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Eroare ștergere fișier');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Eroare ștergere fișier temporar:', error);
      throw error;
    }
  }

  /**
   * Flux complet: generează PDF, uploadează, trimite email, șterge
   * @param {Blob} pdfBlob - Blob-ul PDF-ului generat
   * @param {Object} emailData - Datele email-ului
   */
  async sendInvoiceEmail(pdfBlob, emailData) {
    let fileId = null;

    try {
      console.log('📤 Step 1: Upload fișier temporar pe server...');
      // 1. Upload PDF temporar
      const uploadResult = await this.uploadTempFile(pdfBlob, emailData.filename);
      fileId = uploadResult.fileId;
      console.log('✅ Fișier uploadat:', uploadResult);

      console.log('📧 Step 2: Trimitere email...');
      // 2. Trimite email cu atașament
      const sendResult = await this.sendEmail({
        ...emailData,
        fileId
      });
      console.log('✅ Email trimis:', sendResult);

      console.log('🗑️ Step 3: Ștergere fișier temporar...');
      // 3. Șterge fișierul temporar
      await this.deleteTempFile(fileId);
      console.log('✅ Fișier temporar șters');

      return {
        success: true,
        message: `Email trimis cu succes către ${emailData.to}!`
      };

    } catch (error) {
      // Încearcă să ștergi fișierul chiar dacă a fost eroare
      if (fileId) {
        try {
          await this.deleteTempFile(fileId);
          console.log('🗑️ Fișier temporar șters după eroare');
        } catch (deleteError) {
          console.error('Eroare ștergere fișier după eroare:', deleteError);
        }
      }

      throw error;
    }
  }
}

const emailService = new EmailService();
export default emailService;


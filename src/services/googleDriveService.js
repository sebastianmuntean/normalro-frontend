// Google Drive API Service
// IMPORTANT: Trebuie să configurezi REACT_APP_GOOGLE_CLIENT_ID în .env
// Obține-ți un Client ID de la: https://console.cloud.google.com/apis/credentials

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

class GoogleDriveService {
  constructor() {
    this.tokenClient = null;
    this.gapiInited = false;
    this.gisInited = false;
    this.accessToken = null;
  }

  // Inițializează Google API
  async initializeGapi() {
    return new Promise((resolve) => {
      if (this.gapiInited) {
        resolve();
        return;
      }

      if (!window.gapi) {
        console.error('Google API nu este încărcat');
        resolve();
        return;
      }

      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: '', // Nu e nevoie de API Key pentru upload
            discoveryDocs: [DISCOVERY_DOC],
          });
          this.gapiInited = true;
          console.log('Google API inițializat');
        } catch (error) {
          console.error('Eroare inițializare Google API:', error);
        }
        resolve();
      });
    });
  }

  // Inițializează Google Identity Services
  initializeGis() {
    if (this.gisInited) return;

    if (!window.google || !window.google.accounts) {
      console.error('Google Identity Services nu este încărcat');
      return;
    }

    if (!CLIENT_ID) {
      console.error('Google Client ID nu este configurat. Setează REACT_APP_GOOGLE_CLIENT_ID în .env');
      return;
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // Va fi setat dinamic
    });

    this.gisInited = true;
    console.log('Google Identity Services inițializat');
  }

  // Cere autorizare de la utilizator
  async requestAuthorization() {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Google Identity Services nu este inițializat. Verifică configurarea CLIENT_ID.'));
        return;
      }

      this.tokenClient.callback = (response) => {
        if (response.error) {
          reject(response);
          return;
        }
        this.accessToken = response.access_token;
        resolve(response.access_token);
      };

      // Verifică dacă utilizatorul are deja un token valid
      if (this.accessToken && window.gapi.client.getToken()) {
        resolve(this.accessToken);
      } else {
        // Cere autorizare
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      }
    });
  }

  // Upload fișier în Google Drive
  async uploadFile(fileBlob, fileName, mimeType) {
    if (!this.gapiInited) {
      throw new Error('Google API nu este inițializat');
    }

    if (!this.accessToken) {
      throw new Error('Nu există token de acces. Autorizarea este necesară.');
    }

    const metadata = {
      name: fileName,
      mimeType: mimeType,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', fileBlob);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Eroare upload: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  // Deconectare
  signOut() {
    const token = window.gapi?.client?.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
    }
    this.accessToken = null;
  }

  // Verifică dacă este configurat
  isConfigured() {
    return Boolean(CLIENT_ID);
  }

  // Obține link-ul de configurare
  getConfigurationGuideUrl() {
    return 'https://console.cloud.google.com/apis/credentials';
  }
}

// Export singleton instance
const googleDriveService = new GoogleDriveService();
export default googleDriveService;


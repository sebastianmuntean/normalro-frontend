import React from 'react';
import { Container, Typography, Box, Paper, Stack, Divider } from '@mui/material';
import useDocumentTitle from '../hooks/useDocumentTitle';

const PrivacyPolicy = () => {
  useDocumentTitle(
    'Politica de Confidențialitate',
    'Politica de confidențialitate normal.ro - cum colectăm, utilizăm și protejăm informațiile tale personale conform GDPR.'
  );
  
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" gutterBottom>
              Politica de Confidențialitate
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ultima actualizare: 25 octombrie 2025
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h5" gutterBottom>
              1. Introducere
            </Typography>
            <Typography variant="body1" paragraph>
              Bine ai venit pe normal.ro. Confidențialitatea ta este importantă pentru noi. Această Politică de 
              Confidențialitate explică cum colectăm, utilizăm și protejăm informațiile tale personale când folosești 
              serviciile noastre.
            </Typography>
            <Typography variant="body1" paragraph>
              Operatorul site-ului este:
            </Typography>
            <Typography variant="body1" component="div" sx={{ pl: 2 }}>
              <strong>Pravalia SRL</strong><br />
              CUI: 37024165<br />
              Reg Com: J32/124/2017<br />
              Adresă: Str. Siretului, Nr. 20, Mun. Sibiu, SIBIU, Romania<br />
              Email: contact@normal.ro
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              2. Informații pe care le colectăm
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              2.1 Informații furnizate de utilizatori
            </Typography>
            <Typography variant="body1" paragraph>
              Când folosești instrumentele noastre (ex: Generator Facturi), poți introduce voluntar:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Date despre companii (nume, CUI, adresă) - pentru generarea facturilor</li>
              <li>Date despre produse și servicii - pentru liniile de factură</li>
              <li>Fișiere atașate - pentru export XML (e-Factura)</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              2.2 Stocare locală (Browser)
            </Typography>
            <Typography variant="body1" paragraph>
              Cu consimțământul tău explicit, stocăm date criptate în browser-ul tău (cookies) pentru:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Salvarea datelor furnizorului pentru completare automată</li>
              <li>Preferințe de limbă</li>
              <li>Setări ale instrumentelor</li>
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Important:</strong> Aceste date sunt stocate LOCAL în browser-ul tău și NU sunt trimise către 
              serverele noastre.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              2.3 Informații tehnice
            </Typography>
            <Typography variant="body1" paragraph>
              Colectăm automat informații tehnice de bază:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Adresa IP</li>
              <li>Tipul browser-ului</li>
              <li>Sistemul de operare</li>
              <li>Pagini vizitate și durata vizitei</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              3. Cum folosim informațiile
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li><strong>Furnizarea serviciilor:</strong> Pentru a genera facturi, documente și alte rezultate</li>
              <li><strong>Îmbunătățirea serviciilor:</strong> Pentru a înțelege cum sunt folosite instrumentele</li>
              <li><strong>Integrări externe:</strong> Cu consimțământul tău, pentru integrări cu servicii terțe (ex: Google Drive, ANAF API)</li>
              <li><strong>Comunicare:</strong> Pentru a răspunde la întrebări și cereri de suport</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              4. Integrări cu servicii terțe
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              4.1 Google Drive
            </Typography>
            <Typography variant="body1" paragraph>
              Când folosești funcția "Salvează în Google Drive":
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Solicităm permisiunea: <code>drive.file</code> (acces doar la fișierele create de aplicația noastră)</li>
              <li>NU avem acces la alte fișiere din Google Drive-ul tău</li>
              <li>NU ștergem sau modificăm fișiere existente</li>
              <li>Poți revoca accesul oricând din <a href="https://myaccount.google.com/permissions" target="_blank">Google Account Permissions</a></li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              4.2 ANAF API
            </Typography>
            <Typography variant="body1" paragraph>
              Când folosești căutarea ANAF (căutare companie după CUI):
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Trimitem CUI-ul introdus de tine către API-ul public ANAF</li>
              <li>Primim date publice despre companie (nume, adresă, reg com)</li>
              <li>NU stocăm aceste date pe serverele noastre</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              5. Partajarea datelor
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>NU vindem, NU închiriem și NU partajăm datele tale personale cu terți</strong>, cu excepția:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li><strong>La cererea ta explicită:</strong> Când folosești integrări (Google Drive, ANAF)</li>
              <li><strong>Obligații legale:</strong> Dacă suntem obligați prin lege să furnizăm informații autorităților</li>
              <li><strong>Furnizori de servicii:</strong> Hosting, CDN (date minime, doar tehnice)</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              6. Securitatea datelor
            </Typography>
            <Typography variant="body1" paragraph>
              Luăm măsuri de securitate pentru a proteja datele tale:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Criptare AES-256 pentru datele stocate în cookies</li>
              <li>Conexiune HTTPS pentru toate cererile</li>
              <li>Validare și sanitizare a datelor de intrare</li>
              <li>Acces limitat la servere și baze de date</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              7. Drepturile tale (GDPR)
            </Typography>
            <Typography variant="body1" paragraph>
              Conform Regulamentului General privind Protecția Datelor (GDPR), ai următoarele drepturi:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li><strong>Dreptul de acces:</strong> Poți solicita o copie a datelor tale personale</li>
              <li><strong>Dreptul la rectificare:</strong> Poți corecta datele incorecte</li>
              <li><strong>Dreptul la ștergere:</strong> Poți cere ștergerea datelor (cookies locale pot fi șterse din browser)</li>
              <li><strong>Dreptul la portabilitate:</strong> Poți exporta datele tale</li>
              <li><strong>Dreptul de opoziție:</strong> Poți refuza procesarea datelor</li>
            </Typography>
            <Typography variant="body1" paragraph>
              Pentru exercitarea acestor drepturi, contactează-ne la: <strong>contact@normal.ro</strong>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              8. Cookies și tehnologii similare
            </Typography>
            <Typography variant="body1" paragraph>
              Folosim cookies pentru:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li><strong>Cookies funcționale:</strong> Pentru salvarea preferințelor și datelor furnizorului (cu consimțământul tău)</li>
              <li><strong>Cookies de sesiune:</strong> Pentru funcționalitatea site-ului</li>
              <li><strong>Cookies analitice:</strong> Pentru statistici anonime de utilizare</li>
            </Typography>
            <Typography variant="body1" paragraph>
              Poți șterge cookies-urile din setările browser-ului tău oricând.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              9. Copii și minori
            </Typography>
            <Typography variant="body1" paragraph>
              Serviciile noastre nu sunt destinate copiilor sub 16 ani. Nu colectăm în mod conștient date de la copii.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              10. Modificări ale politicii
            </Typography>
            <Typography variant="body1" paragraph>
              Ne rezervăm dreptul de a actualiza această Politică de Confidențialitate. Modificările vor fi postate 
              pe această pagină cu data actualizării. Continuarea utilizării serviciilor după modificări constituie 
              acceptarea noii politici.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              11. Contact
            </Typography>
            <Typography variant="body1" paragraph>
              Pentru întrebări despre această Politică de Confidențialitate sau despre datele tale personale, 
              contactează-ne:
            </Typography>
            <Typography variant="body1" component="div" sx={{ pl: 2 }}>
              <strong>Pravalia SRL</strong><br />
              Email: contact@normal.ro<br />
              Adresă: Str. Siretului, Nr. 20, Mun. Sibiu, SIBIU, Romania<br />
              CUI: 37024165
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              12. Autoritate de supraveghere
            </Typography>
            <Typography variant="body1" paragraph>
              Ai dreptul să depui o plângere la autoritatea de supraveghere:
            </Typography>
            <Typography variant="body1" component="div" sx={{ pl: 2 }}>
              <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong><br />
              Website: <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a><br />
              Email: anspdcp@dataprotection.ro
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              © 2025 Pravalia SRL. Toate drepturile rezervate.<br />
              CUI: 37024165 | Reg Com: J32/124/2017
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;


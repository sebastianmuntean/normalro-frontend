import React from 'react';
import { Container, Typography, Box, Paper, Stack, Divider } from '@mui/material';

const TermsOfService = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" gutterBottom>
              Termeni și Condiții
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ultima actualizare: 25 octombrie 2025
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h5" gutterBottom>
              1. Acceptarea termenilor
            </Typography>
            <Typography variant="body1" paragraph>
              Prin accesarea și utilizarea site-ului normal.ro ("Serviciul"), confirmi că ai citit, înțeles și 
              acceptat acești Termeni și Condiții. Dacă nu ești de acord cu acești termeni, te rugăm să nu 
              folosești Serviciul.
            </Typography>
            <Typography variant="body1" paragraph>
              Serviciul este operat de:
            </Typography>
            <Typography variant="body1" component="div" sx={{ pl: 2 }}>
              <strong>Pravalia SRL</strong><br />
              CUI: 37024165<br />
              Reg Com: J32/124/2017<br />
              Adresă: Str. Siretului, Nr. 20, Mun. Sibiu, SIBIU, Romania
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              2. Descrierea serviciului
            </Typography>
            <Typography variant="body1" paragraph>
              normal.ro oferă o colecție de instrumente online gratuite, inclusiv dar fără a se limita la:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Generator de facturi și facturi proforma</li>
              <li>Calculatoare diverse (TVA, procente, etc.)</li>
              <li>Generatoare de coduri (QR, CNP, UUID, etc.)</li>
              <li>Convertoare (unități, culori, baze numerice, etc.)</li>
              <li>Instrumente de dezvoltare (CSS, regex, etc.)</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              3. Utilizarea serviciului
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              3.1 Utilizare permisă
            </Typography>
            <Typography variant="body1" paragraph>
              Ai dreptul să folosești Serviciul în scopuri personale sau profesionale legale.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              3.2 Utilizare interzisă
            </Typography>
            <Typography variant="body1" paragraph>
              Este interzis să:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Folosești Serviciul în scopuri ilegale sau frauduloase</li>
              <li>Încerci să obții acces neautorizat la sisteme sau date</li>
              <li>Supraîncarci serverele cu cereri automate excesive (spam, DDoS)</li>
              <li>Copiezi, modifici sau distribuiți conținutul site-ului fără permisiune</li>
              <li>Folosești Serviciul pentru a genera documente false sau înșelătoare</li>
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
              Serviciul oferă integrare opțională cu Google Drive pentru salvarea fișierelor. Prin utilizarea 
              acestei funcții:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Accepți <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Politica de Confidențialitate Google</a></li>
              <li>Accepți <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Termenii de Serviciu Google</a></li>
              <li>Autorizezi aplicația să creeze fișiere în Google Drive-ul tău</li>
              <li>Poți revoca accesul oricând din setările contului Google</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              4.2 ANAF API
            </Typography>
            <Typography variant="body1" paragraph>
              Serviciul folosește API-ul public ANAF pentru căutarea informațiilor despre companii. Datele obținute 
              sunt publice și disponibile în registrul ANAF.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              5. Proprietate intelectuală
            </Typography>
            <Typography variant="body1" paragraph>
              Toate drepturile de proprietate intelectuală asupra Serviciului (cod sursă, design, logo, conținut) 
              aparțin Pravalia SRL, cu excepția bibliotecilor open-source utilizate conform licențelor lor.
            </Typography>
            <Typography variant="body1" paragraph>
              Documentele generate de tine (facturi, rapoarte, etc.) îți aparțin integral.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              6. Limitarea răspunderii
            </Typography>
            <Typography variant="body1" paragraph>
              Serviciul este furnizat "CA ATARE" și "DUPĂ CUM ESTE DISPONIBIL", fără garanții de niciun fel.
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li><strong>Acuratețe:</strong> Nu garantăm acuratețea absolută a calculelor sau datelor generate. 
                  Verifică întotdeauna rezultatele.</li>
              <li><strong>Disponibilitate:</strong> Serviciul poate fi întrerupt temporar pentru mentenanță sau 
                  din cauze tehnice.</li>
              <li><strong>Pierderi:</strong> Nu suntem răspunzători pentru pierderi financiare sau de date rezultate 
                  din utilizarea Serviciului.</li>
              <li><strong>Conformitate fiscală:</strong> Facturile generate trebuie verificate de un contabil autorizat 
                  pentru conformitate fiscală.</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              7. Responsabilitatea utilizatorului
            </Typography>
            <Typography variant="body1" paragraph>
              Tu ești responsabil pentru:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Acuratețea datelor introduse în instrumente</li>
              <li>Conformitatea documentelor generate cu legislația în vigoare</li>
              <li>Backup-ul datelor tale importante</li>
              <li>Securitatea contului tău și a dispozitivelor folosite</li>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              8. Modificări ale serviciului
            </Typography>
            <Typography variant="body1" paragraph>
              Ne rezervăm dreptul să:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Modificăm, suspendem sau întrerupem orice parte a Serviciului</li>
              <li>Actualizăm instrumentele și funcționalitățile</li>
              <li>Introducem funcții noi sau eliminăm funcții existente</li>
            </Typography>
            <Typography variant="body1" paragraph>
              Vom încerca să anunțăm modificările majore în avans, când este posibil.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              9. Încetarea utilizării
            </Typography>
            <Typography variant="body1" paragraph>
              Poți înceta să folosești Serviciul oricând. Ne rezervăm dreptul să restricționăm sau să suspendăm 
              accesul utilizatorilor care încalcă acești termeni.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              10. Legea aplicabilă
            </Typography>
            <Typography variant="body1" paragraph>
              Acești Termeni și Condiții sunt guvernați de legile României. Orice dispute vor fi soluționate de 
              instanțele competente din România.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              11. Modificări ale termenilor
            </Typography>
            <Typography variant="body1" paragraph>
              Ne rezervăm dreptul de a modifica acești Termeni și Condiții oricând. Modificările vor fi postate 
              pe această pagină cu data actualizării. Continuarea utilizării Serviciului după modificări constituie 
              acceptarea noilor termeni.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              12. Contact
            </Typography>
            <Typography variant="body1" paragraph>
              Pentru întrebări despre acești Termeni și Condiții, contactează-ne:
            </Typography>
            <Typography variant="body1" component="div" sx={{ pl: 2 }}>
              <strong>Pravalia SRL</strong><br />
              Email: contact@normal.ro<br />
              Adresă: Str. Siretului, Nr. 20, Mun. Sibiu, SIBIU, Romania<br />
              CUI: 37024165 | Reg Com: J32/124/2017
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              © 2025 Pravalia SRL. Toate drepturile rezervate.<br />
              Ultima actualizare: 25 octombrie 2025
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default TermsOfService;


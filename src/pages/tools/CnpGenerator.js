import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { generateCnp, validateCnp } from '../../services/api';

const countyOptions = [
  { code: '01', name: 'Alba' },
  { code: '02', name: 'Arad' },
  { code: '03', name: 'Argeș' },
  { code: '04', name: 'Bacău' },
  { code: '05', name: 'Bihor' },
  { code: '06', name: 'Bistrița-Năsăud' },
  { code: '07', name: 'Botoșani' },
  { code: '08', name: 'Brașov' },
  { code: '09', name: 'Brăila' },
  { code: '10', name: 'Buzău' },
  { code: '11', name: 'Caraș-Severin' },
  { code: '12', name: 'Cluj' },
  { code: '13', name: 'Constanța' },
  { code: '14', name: 'Covasna' },
  { code: '15', name: 'Dâmbovița' },
  { code: '16', name: 'Dolj' },
  { code: '17', name: 'Galați' },
  { code: '18', name: 'Gorj' },
  { code: '19', name: 'Harghita' },
  { code: '20', name: 'Hunedoara' },
  { code: '21', name: 'Ialomița' },
  { code: '22', name: 'Iași' },
  { code: '23', name: 'Ilfov' },
  { code: '24', name: 'Maramureș' },
  { code: '25', name: 'Mehedinți' },
  { code: '26', name: 'Mureș' },
  { code: '27', name: 'Neamț' },
  { code: '28', name: 'Olt' },
  { code: '29', name: 'Prahova' },
  { code: '30', name: 'Satu Mare' },
  { code: '31', name: 'Sălaj' },
  { code: '32', name: 'Sibiu' },
  { code: '33', name: 'Suceava' },
  { code: '34', name: 'Teleorman' },
  { code: '35', name: 'Timiș' },
  { code: '36', name: 'Tulcea' },
  { code: '37', name: 'Vaslui' },
  { code: '38', name: 'Vâlcea' },
  { code: '39', name: 'Vrancea' },
  { code: '40', name: 'București' },
  { code: '41', name: 'București - Sector 1' },
  { code: '42', name: 'București - Sector 2' },
  { code: '43', name: 'București - Sector 3' },
  { code: '44', name: 'București - Sector 4' },
  { code: '45', name: 'București - Sector 5' },
  { code: '46', name: 'București - Sector 6' },
  { code: '51', name: 'Călărași' },
  { code: '52', name: 'Giurgiu' }
];

const genderOptions = ['random', 'male', 'female'];

const CnpDetails = ({ result, copied, onCopy, t }) => (
  <Stack spacing={2}>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {t('tools.cnpGenerator.result.label')}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {result.cnp}
        </Typography>
      </Box>
      <IconButton color={copied ? 'success' : 'primary'} onClick={onCopy}>
        {copied ? <CheckIcon /> : <ContentCopyIcon />}
      </IconButton>
    </Stack>

    <Paper variant="outlined" sx={{ borderRadius: 2, p: 3 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2" color="text.secondary">
          {t('tools.cnpGenerator.result.detailsTitle')}
        </Typography>
        <Typography variant="body2">
          <strong>{t('tools.cnpGenerator.result.gender')}:</strong>{' '}
          {t(`tools.cnpGenerator.gender.${result.details.gender}`)}
        </Typography>
        <Typography variant="body2">
          <strong>{t('tools.cnpGenerator.result.birthDate')}:</strong>{' '}
          {result.details.birthDate}
        </Typography>
        <Typography variant="body2">
          <strong>{t('tools.cnpGenerator.result.county')}:</strong>{' '}
          {result.details.countyCode} – {result.details.countyName}
        </Typography>
        <Typography variant="body2">
          <strong>{t('tools.cnpGenerator.result.serial')}:</strong>{' '}
          {result.details.serial}
        </Typography>
        <Typography variant="body2">
          <strong>{t('tools.cnpGenerator.result.controlDigit')}:</strong>{' '}
          {result.details.controlDigit}
        </Typography>
      </Stack>
    </Paper>
  </Stack>
);

const CnpGenerator = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    birthDate: '',
    gender: 'random',
    countyCode: ''
  });
  const [generatorResult, setGeneratorResult] = useState(null);
  const [generatorError, setGeneratorError] = useState('');
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generatorCopied, setGeneratorCopied] = useState(false);

  const [cnpInput, setCnpInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [validateLoading, setValidateLoading] = useState(false);
  const [validationCopied, setValidationCopied] = useState(false);

  const genderLabels = useMemo(
    () => ({
      random: t('tools.cnpGenerator.gender.random'),
      male: t('tools.cnpGenerator.gender.male'),
      female: t('tools.cnpGenerator.gender.female'),
      unknown: t('tools.cnpGenerator.gender.unknown')
    }),
    [t]
  );

  const handleGenderChange = (_, newGender) => {
    if (newGender) {
      setForm((prev) => ({ ...prev, gender: newGender }));
    }
  };

  const handleFieldChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setGenerateLoading(true);
    setGeneratorError('');
    setGeneratorResult(null);
    setGeneratorCopied(false);

    const payload = {};
    if (form.birthDate) payload.birthDate = form.birthDate;
    if (form.gender !== 'random') payload.gender = form.gender;
    if (form.countyCode) payload.countyCode = form.countyCode;

    try {
      const response = await generateCnp(payload);
      setGeneratorResult(response.data);
    } catch (err) {
      const errorCode = err?.response?.data?.error;
      if (errorCode === 'invalid_birth_date') {
        setGeneratorError(t('tools.cnpGenerator.messages.invalidBirthDate'));
      } else if (errorCode === 'invalid_gender') {
        setGeneratorError(t('tools.cnpGenerator.messages.invalidGender'));
      } else if (errorCode === 'invalid_county') {
        setGeneratorError(t('tools.cnpGenerator.messages.invalidCounty'));
      } else {
        setGeneratorError(t('common.genericError'));
      }
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ birthDate: '', gender: 'random', countyCode: '' });
    setGeneratorResult(null);
    setGeneratorError('');
    setGeneratorCopied(false);
  };

  const handleGeneratorCopy = async () => {
    if (!generatorResult?.cnp) return;
    try {
      await navigator.clipboard.writeText(generatorResult.cnp);
      setGeneratorCopied(true);
      setTimeout(() => setGeneratorCopied(false), 2000);
    } catch {
      setGeneratorError(t('common.genericError'));
    }
  };

  const handleValidate = async (event) => {
    event.preventDefault();
    const trimmed = cnpInput.replace(/\s+/g, '');

    if (!trimmed) {
      setValidationError(t('tools.cnpGenerator.messages.emptyCnp'));
      setValidationResult(null);
      return;
    }
    if (!/^\d{13}$/.test(trimmed)) {
      setValidationError(t('tools.cnpGenerator.messages.invalidCnpFormat'));
      setValidationResult(null);
      return;
    }

    setValidateLoading(true);
    setValidationError('');
    setValidationResult(null);
    setValidationCopied(false);

    try {
      const response = await validateCnp(trimmed);
      setValidationResult(response.data);
    } catch (err) {
      const errorCode = err?.response?.data?.error;
      if (errorCode === 'invalid_cnp') {
        setValidationError(t('tools.cnpGenerator.messages.invalidCnp'));
      } else {
        setValidationError(t('common.genericError'));
      }
    } finally {
      setValidateLoading(false);
    }
  };

  const handleValidationReset = () => {
    setCnpInput('');
    setValidationResult(null);
    setValidationError('');
    setValidationCopied(false);
  };

  const handleValidationCopy = async () => {
    if (!validationResult?.cnp) return;
    try {
      await navigator.clipboard.writeText(validationResult.cnp);
      setValidationCopied(true);
      setTimeout(() => setValidationCopied(false), 2000);
    } catch {
      setValidationError(t('common.genericError'));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={4}>
        <Paper
          component="form"
          onSubmit={handleGenerate}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)'
          }}
        >
          <Stack spacing={4}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }} gutterBottom>
                {t('tools.cnpGenerator.heading')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('tools.cnpGenerator.instructions')}
              </Typography>
            </Box>

            {generatorError && <Alert severity="error">{generatorError}</Alert>}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <TextField
                label={t('tools.cnpGenerator.fields.birthDate')}
                type="date"
                value={form.birthDate}
                onChange={handleFieldChange('birthDate')}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="county-code-label">
                  {t('tools.cnpGenerator.fields.county')}
                </InputLabel>
                <Select
                  labelId="county-code-label"
                  label={t('tools.cnpGenerator.fields.county')}
                  value={form.countyCode}
                  onChange={handleFieldChange('countyCode')}
                  displayEmpty
                >
                  <MenuItem value="">
                    {t('tools.cnpGenerator.fields.autoSelect')}
                  </MenuItem>
                  {countyOptions.map((county) => (
                    <MenuItem key={county.code} value={county.code}>
                      {county.code} – {county.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {t('tools.cnpGenerator.fields.gender')}
              </Typography>
              <ToggleButtonGroup
                value={form.gender}
                exclusive
                onChange={handleGenderChange}
                color="primary"
              >
                {genderOptions.map((option) => (
                  <ToggleButton key={option} value={option}>
                    {genderLabels[option]}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button type="submit" variant="contained" disabled={generateLoading}>
                {t('tools.cnpGenerator.actions.generate')}
              </Button>
              <Button type="button" variant="outlined" onClick={handleReset}>
                {t('tools.cnpGenerator.actions.reset')}
              </Button>
            </Stack>

            {generatorResult?.cnp && (
              <CnpDetails
                result={generatorResult}
                copied={generatorCopied}
                onCopy={handleGeneratorCopy}
                t={t}
              />
            )}
          </Stack>
        </Paper>

        <Paper
          component="form"
          onSubmit={handleValidate}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)'
          }}
        >
          <Stack spacing={4}>
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }} gutterBottom>
                {t('tools.cnpGenerator.validation.heading')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('tools.cnpGenerator.validation.subtitle')}
              </Typography>
            </Box>

            {validationError && <Alert severity="error">{validationError}</Alert>}

            <TextField
              label={t('tools.cnpGenerator.validation.label')}
              value={cnpInput}
              onChange={(event) => setCnpInput(event.target.value)}
              placeholder={t('tools.cnpGenerator.validation.placeholder')}
              inputProps={{ maxLength: 20 }}
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button type="submit" variant="contained" disabled={validateLoading}>
                {t('tools.cnpGenerator.validation.validateButton')}
              </Button>
              <Button type="button" variant="outlined" onClick={handleValidationReset}>
                {t('tools.cnpGenerator.validation.resetButton')}
              </Button>
            </Stack>

            {validationResult?.cnp && (
              <CnpDetails
                result={validationResult}
                copied={validationCopied}
                onCopy={handleValidationCopy}
                t={t}
              />
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default CnpGenerator;

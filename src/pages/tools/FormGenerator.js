import React, { useState } from 'react';
import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const fieldTypes = ['text', 'email', 'number', 'textarea', 'checkbox', 'select'];

const createName = (label) => label.toLowerCase().replace(/\s+/g, '-');

const FormGenerator = () => {
  const { t } = useTranslation();
  const [fieldType, setFieldType] = useState('text');
  const [label, setLabel] = useState('Name');
  const [fields, setFields] = useState([]);

  const addField = () => {
    if (!label.trim()) return;
    setFields((prev) => [...prev, { type: fieldType, label: label.trim() }]);
  };

  const removeField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const html = `<form class="generated-form">
${fields
  .map((field) => {
    const name = createName(field.label);
    switch (field.type) {
      case 'textarea':
        return `  <label>${field.label}<textarea name="${name}"></textarea></label>`;
      case 'checkbox':
        return `  <label><input type="checkbox" name="${name}"> ${field.label}</label>`;
      case 'select':
        return `  <label>${field.label}<select name="${name}">
      <option>Option 1</option>
      <option>Option 2</option>
    </select></label>`;
      default:
        return `  <label>${field.label}<input type="${field.type}" name="${name}"></label>`;
    }
  })
  .join('\n')}
  <button type="submit">${t('tools.formGenerator.sample.submit')}</button>
</form>`;

  const css = `.generated-form {
  display: grid;
  gap: 1rem;
  max-width: 420px;
}
.generated-form label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  gap: 0.25rem;
}
.generated-form input,
.generated-form textarea,
.generated-form select {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.15);
}
.generated-form button {
  padding: 0.75rem;
  border: none;
  background: #2563eb;
  color: white;
  border-radius: 8px;
  font-weight: 600;
}`;

  return (
    <ToolLayout title={t('tools.formGenerator.heading')} description={t('tools.formGenerator.instructions')}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>{t('tools.formGenerator.fields.type')}</InputLabel>
            <Select value={fieldType} label={t('tools.formGenerator.fields.type')} onChange={(event) => setFieldType(event.target.value)}>
              {fieldTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {t(`tools.formGenerator.types.${type}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label={t('tools.formGenerator.fields.label')} value={label} onChange={(event) => setLabel(event.target.value)} />
          <Button variant="contained" onClick={addField}>
            {t('tools.formGenerator.actions.add')}
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {fields.map((field, index) => (
            <Chip key={`${field.label}-${index}`} label={`${field.label} (${field.type})`} onDelete={() => removeField(index)} />
          ))}
        </Stack>
        <Typography variant="subtitle2" color="text.secondary">
          {t('tools.formGenerator.result.label')}
        </Typography>
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
          {html}

<style>
{css}
</style>
        </Box>
      </Stack>
    </ToolLayout>
  );
};

export default FormGenerator;

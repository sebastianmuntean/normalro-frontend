import React, { useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, Grid, Stack, TextField } from '@mui/material';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

const TableGenerator = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [output, setOutput] = useState('');

  const generate = () => {
    const rowCount = Math.max(1, rows);
    const colCount = Math.max(1, columns);
    const headerRow = includeHeader
      ? `<thead>\n  <tr>${Array.from({ length: colCount })
          .map((_, index) => `\n    <th>${t('tools.tableGenerator.sample.header', { index: index + 1 })}</th>`)
          .join('')}\n  </tr>\n</thead>\n`
      : '';
    const bodyRows = Array.from({ length: rowCount })
      .map(
        (_, rowIndex) =>
          `  <tr>${Array.from({ length: colCount })
            .map((__, colIndex) => `\n    <td>${t('tools.tableGenerator.sample.cell', { row: rowIndex + 1, column: colIndex + 1 })}</td>`)
            .join('')}\n  </tr>`
      )
      .join('\n');
    const html = `<table class="custom-table">\n${headerRow}<tbody>\n${bodyRows}\n</tbody>\n</table>`;
    const css = `.custom-table {\n  width: 100%;\n  border-collapse: collapse;\n}\n.custom-table th, .custom-table td {\n  border: 1px solid rgba(0,0,0,0.12);\n  padding: 0.75rem;\n  text-align: left;\n}\n.custom-table thead {\n  background: rgba(0,0,0,0.04);\n  font-weight: 600;\n}`;
    setOutput(`${html}\n\n<style>\n${css}\n</style>`);
  };

  return (
    <ToolLayout title={t('tools.tableGenerator.heading')} description={t('tools.tableGenerator.instructions')} seoSlug="table-generator">
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <TextField type="number" label={t('tools.tableGenerator.fields.rows')} value={rows} onChange={(event) => setRows(Number(event.target.value) || 0)} />
            <TextField type="number" label={t('tools.tableGenerator.fields.columns')} value={columns} onChange={(event) => setColumns(Number(event.target.value) || 0)} />
            <FormControlLabel
              control={<Checkbox checked={includeHeader} onChange={(event) => setIncludeHeader(event.target.checked)} />}
              label={t('tools.tableGenerator.fields.includeHeader')}
            />
            <Button variant="contained" onClick={generate}>
              {t('tools.tableGenerator.actions.generate')}
            </Button>
          </Stack>
        </Grid>
        <Grid item xs={12} md={7}>
          {output && (
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)' }}>
              {output}
            </Box>
          )}
        </Grid>
      </Grid>
    </ToolLayout>
  );
};

export default TableGenerator;

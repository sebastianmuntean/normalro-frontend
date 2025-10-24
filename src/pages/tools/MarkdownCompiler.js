import React, { useMemo, useState } from 'react';
import { Box, Grid, Stack, TextField, Typography } from '@mui/material';
import { marked } from 'marked';
import ToolLayout from '../../components/ToolLayout';
import { useTranslation } from 'react-i18next';

marked.setOptions({ breaks: true });

const MarkdownCompiler = () => {
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState('# normal.ro\n\n**Markdown** preview.');

  const html = useMemo(() => marked.parse(markdown), [markdown]);

  return (
    <ToolLayout title={t('tools.markdownCompiler.heading')} description={t('tools.markdownCompiler.instructions')}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <TextField
              label={t('tools.markdownCompiler.fields.input')}
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              multiline
              minRows={12}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', p: 2, maxHeight: 480, overflowY: 'auto' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('tools.markdownCompiler.preview.label')}
            </Typography>
            <Box sx={{ '& h1,h2,h3,h4': { mt: 2 }, '& p': { mb: 1.5 } }} dangerouslySetInnerHTML={{ __html: html }} />
          </Box>
        </Grid>
      </Grid>
    </ToolLayout>
  );
};

export default MarkdownCompiler;

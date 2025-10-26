import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatCompactDate } from '../services/dateService';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Page = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Set document title and description when page loads
  useDocumentTitle(
    page?.title || 'Articol',
    page?.content ? page.content.replace(/<[^>]*>/g, '').substring(0, 155) : null
  );

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/pages/${slug}`);
        setPage(response.data);
      } catch (err) {
        console.error('Failed to load page:', err);
        if (err.response?.status === 404) {
          setError(t('page.pageNotFound'));
        } else {
          setError(t('page.failedToLoad'));
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug, t]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography 
          variant="body1" 
          color="primary" 
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => navigate('/')}
        >
          {t('page.backToHome')}
        </Typography>
      </Container>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Back link */}
      <Typography 
        variant="body1" 
        color="primary" 
        sx={{ cursor: 'pointer', textDecoration: 'underline', mb: 3 }}
        onClick={() => navigate('/')}
      >
        {t('page.backToHome')}
      </Typography>

      {/* Article header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            lineHeight: 1.2,
            mb: 2
          }}
        >
          {page.title}
        </Typography>

        {/* Article metadata */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('home.by')} <strong>{page.author}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCompactDate(page.created_at, i18n.language)}
          </Typography>
        </Box>
      </Box>

      {/* Article content */}
      <Box 
        sx={{ 
          '& p': { 
            fontSize: '1.1rem',
            lineHeight: 1.6,
            fontFamily: 'Georgia, serif',
            mb: 2
          },
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold',
            mt: 3,
            mb: 2
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 1,
            mb: 2
          },
          '& blockquote': {
            borderLeft: '4px solid #ccc',
            paddingLeft: 2,
            margin: '16px 0',
            fontStyle: 'italic',
            color: 'text.secondary'
          },
          '& ul, & ol': {
            paddingLeft: 3,
            mb: 2
          },
          '& li': {
            fontSize: '1.1rem',
            lineHeight: 1.6,
            mb: 1
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'underline'
          }
        }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      {/* Article footer */}
      <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #eee' }}>
        <Typography variant="body2" color="text.secondary">
          {t('page.lastUpdated')} {formatCompactDate(page.updated_at, i18n.language)}
        </Typography>
      </Box>
    </Container>
  );
};

export default Page; 
import React from 'react';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

const FlagIcon = ({ country, size = 20 }) => {
  const flagUrls = {
    us: 'https://flagcdn.com/w20/us.png',
    ro: 'https://flagcdn.com/w20/ro.png'
  };

  return (
    <img 
      src={flagUrls[country]} 
      alt={`${country} flag`}
      style={{ 
        width: size, 
        height: 'auto',
        borderRadius: '2px',
        display: 'block'
      }}
      onError={(e) => {
        // Fallback to emoji if image fails
        e.target.style.display = 'none';
        e.target.nextSibling && (e.target.nextSibling.style.display = 'inline');
      }}
    />
  );
};

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageToggle = () => {
    const newLanguage = i18n.language === 'en' ? 'ro' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const currentFlag = i18n.language === 'en' ? 'us' : 'ro';

  return (
    <IconButton 
      onClick={handleLanguageToggle}
      sx={{ 
        padding: '4px',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        }
      }}
      size="small"
    >
      <FlagIcon country={currentFlag} />
      <span style={{ display: 'none' }}>
        {i18n.language === 'en' ? '🇺🇸' : '🇷🇴'}
      </span>
    </IconButton>
  );
};

export default LanguageSelector; 
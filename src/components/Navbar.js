import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import Logo from './Logo';
import { tools as catalog } from '../data/tools';
import '../App.css';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: t('nav.home') },
    ...catalog.map((tool) => ({
      to: `/tools/${tool.slug}`,
      label: t(tool.titleKey)
    }))
  ];

  const toggleDrawer = (value) => () => {
    setOpen(value);
  };

  return (
    <>
      <AppBar
        position="static"
        className="App-header"
        sx={{ backgroundColor: 'transparent', boxShadow: 'none', color: '#333' }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ color: '#333', mr: 1 }}
            aria-label={t('nav.openMenu')}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Logo size={36} />
            </Link>
          </Box>
          <Box sx={{ ml: 1 }}>
            <LanguageSelector />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <Box
          role="presentation"
          sx={{ width: 260, display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Logo size={32} />
            </Link>
            <IconButton onClick={toggleDrawer(false)} aria-label={t('nav.closeMenu')}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List sx={{ flexGrow: 1 }}>
            {links.map((link) => {
              const isActive =
                link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to);
              return (
                <ListItemButton
                  key={link.to}
                  component={Link}
                  to={link.to}
                  onClick={toggleDrawer(false)}
                  selected={isActive}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: isActive ? 600 : 500 }}>{link.label}</Typography>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <LanguageSelector />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
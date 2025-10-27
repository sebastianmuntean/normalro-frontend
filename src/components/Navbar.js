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
  Typography,
  Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import Logo from './Logo';
import { toolCategories } from '../data/tools';
import '../App.css';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleDrawer = (value) => () => {
    setOpen(value);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
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
          <List sx={{ flexGrow: 1, overflow: 'auto' }}>
            {/* Home Link */}
            <ListItemButton
              component={Link}
              to="/"
              onClick={toggleDrawer(false)}
              selected={location.pathname === '/'}
            >
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: location.pathname === '/' ? 600 : 500 }}>
                    {t('nav.home')}
                  </Typography>
                }
              />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />

            {/* Categorized Tools */}
            {toolCategories.map((category) => {
              const isExpanded = expandedCategories[category.id];
              const hasActiveToolInCategory = category.tools.some(tool => 
                location.pathname.includes(`/tools/${tool.slug}`)
              );

              return (
                <Box key={category.id}>
                  {/* Category Header */}
                  <ListItemButton
                    onClick={() => toggleCategory(category.id)}
                    sx={{
                      bgcolor: hasActiveToolInCategory ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: hasActiveToolInCategory ? 700 : 600, fontSize: '0.9rem' }}>
                          {t(category.nameKey)}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {category.tools.length} {category.tools.length === 1 ? 'unealtă' : 'unelte'}
                        </Typography>
                      }
                    />
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>

                  {/* Category Tools */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {category.tools.map((tool) => {
                        const isActive = location.pathname === `/tools/${tool.slug}`;
                        return (
                          <ListItemButton
                            key={tool.slug}
                            component={Link}
                            to={`/tools/${tool.slug}`}
                            onClick={toggleDrawer(false)}
                            selected={isActive}
                            sx={{ pl: 4 }}
                          >
                            <ListItemText
                              primary={
                                <Typography 
                                  sx={{ 
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  {t(tool.titleKey)}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
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
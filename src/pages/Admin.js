import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { Container, Typography, Tabs, Tab, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Alert, TextField, Checkbox, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, InputLabel, Select, MenuItem, FormControl, Pagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/admin`;

// Helper for Tiptap extensions
const tiptapExtensions = [
  StarterKit,
  Link,
  Image,
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] })
];

const Admin = () => {
  const { t } = useTranslation();
  const { token, user } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ username: '', email: '', is_admin: false });
  const [pages, setPages] = useState([]);
  const [editPageId, setEditPageId] = useState(null);
  const [editPageForm, setEditPageForm] = useState({ title: '', content: '', slug: '', status: 'published', parent_id: null });
  const [newPageForm, setNewPageForm] = useState({ title: '', content: '', slug: '', status: 'published', parent_id: null });
  const [error, setError] = useState('');
  const [editPageDialogOpen, setEditPageDialogOpen] = useState(false);
  const [createPageDialogOpen, setCreatePageDialogOpen] = useState(false);
  const [pageDialogError, setPageDialogError] = useState('');

  // Admin pages search and filter states
  const [pageSearch, setPageSearch] = useState('');
  const [pageStatusFilter, setPageStatusFilter] = useState('all');
  const [pageSort, setPageSort] = useState('created_at_desc');
  const [adminPageNumber, setAdminPageNumber] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [adminPagination, setAdminPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [adminLoading, setAdminLoading] = useState(false);

  // Load users
  useEffect(() => {
    if (token && tab === 0) {
      axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setUsers(res.data))
        .catch(() => setError('Failed to load users'));
    }
  }, [token, tab]);

  // Load pages with server-side pagination
  const fetchAdminPages = async () => {
    setAdminLoading(true);
    try {
      const params = {
        page: adminPageNumber,
        limit: itemsPerPage,
        search: pageSearch,
        sort: pageSort,
        status: pageStatusFilter
      };
      
      const response = await axios.get(`${API_URL}/pages`, { 
        headers: { Authorization: `Bearer ${token}` },
        params 
      });
      
      setPages(response.data.pages);
      setAdminPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to load pages:', err);
      setError('Failed to load pages');
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (token && tab === 1) {
      fetchAdminPages();
    }
  }, [token, tab, adminPageNumber, itemsPerPage, pageSearch, pageSort, pageStatusFilter]);

  // --- Users ---
  const handleDeleteUser = (id) => {
    if (!window.confirm('Delete this user?')) return;
    axios.delete(`${API_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => setUsers(users.filter(u => u.id !== id)))
      .catch(() => setError('Failed to delete user'));
  };

  const handleEditUser = (user) => {
    setEditUserId(user.id);
    setEditUserForm({ username: user.username, email: user.email, is_admin: user.is_admin });
  };

  const handleEditUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUserForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveUser = (id) => {
    axios.put(`${API_URL}/users/${id}`, editUserForm, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUsers(users.map(u => u.id === id ? res.data : u));
        setEditUserId(null);
      })
      .catch(() => setError('Failed to update user'));
  };

  // --- Pages ---
  const handleDeletePage = (id) => {
    if (!window.confirm('Delete this page?')) return;
    axios.delete(`${API_URL}/pages/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => setPages(pages.filter(p => p.id !== id)))
      .catch(() => setError('Failed to delete page'));
  };

  const handleEditPage = (page) => {
    console.log('Editing page:', page);
    setEditPageId(page.id);
    setEditPageForm({
      title: page.title,
      content: page.content,
      slug: page.slug,
      status: page.status,
      parent_id: page.parent_id
    });
    setPageDialogError('');
    setEditPageDialogOpen(true);
  };

  const handleEditPageChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditPageForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSavePage = (id) => {
    axios.put(`${API_URL}/pages/${id}`, editPageForm, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setPages(pages.map(p => p.id === id ? { ...p, ...editPageForm } : p));
        setEditPageId(null);
      })
      .catch(() => setError('Failed to update page'));
  };

  const handleNewPageChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPageForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreatePage = () => {
    axios.post(`${API_URL}/pages`, { ...newPageForm, user_id: user.id }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setPages([{ ...newPageForm, id: res.data.id, author: user.username }, ...pages]);
        setNewPageForm({ title: '', content: '', slug: '', status: 'published', parent_id: null });
      })
      .catch(() => setError('Failed to create page'));
  };

  const handleEditPageDialogClose = () => {
    setEditPageDialogOpen(false);
    setEditPageId(null);
  };

  const handleSavePageDialog = () => {
    if (!editPageForm.title || !editPageForm.slug) {
      setPageDialogError('Title and Slug are required!');
      return;
    }
    handleSavePage(editPageId);
    setEditPageDialogOpen(false);
  };

  const handleOpenCreatePageDialog = () => {
    setPageDialogError('');
    setCreatePageDialogOpen(true);
  };

  const handleCloseCreatePageDialog = () => {
    setCreatePageDialogOpen(false);
  };

  const handleCreatePageDialog = () => {
    if (!newPageForm.title || !newPageForm.slug) {
      setPageDialogError('Title and Slug are required!');
      return;
    }
    handleCreatePage();
    setCreatePageDialogOpen(false);
  };

  // Tiptap editor setup for create and edit dialogs
  const createEditor = useEditor({
    extensions: tiptapExtensions,
    content: newPageForm.content,
    onUpdate: ({ editor }) => setNewPageForm(f => ({ ...f, content: editor.getHTML() })),
  });

  const editEditor = useEditor({
    extensions: tiptapExtensions,
    content: editPageForm.content,
    onUpdate: ({ editor }) => setEditPageForm(f => ({ ...f, content: editor.getHTML() })),
    key: editPageId,
  });

  // Ensure editor content is updated when dialog opens or page changes
  React.useEffect(() => {
    if (editEditor && editPageDialogOpen) {
      console.log('Setting editor content:', editPageForm.content);
      editEditor.commands.setContent(editPageForm.content || '');
      console.log('Editor instance:', editEditor);
    }
  }, [editEditor, editPageDialogOpen, editPageForm.content]);

  // Toolbar component for Tiptap
  function TiptapToolbar({ editor }) {
    if (!editor) return null;
    return (
      <Box sx={{ mb: 1 }}>
        <Button size="small" onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'contained' : 'outlined'}>B</Button>
        <Button size="small" onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'contained' : 'outlined'}>I</Button>
        <Button size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} variant={editor.isActive('underline') ? 'contained' : 'outlined'}>U</Button>
        <Button size="small" onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</Button>
        <Button size="small" onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</Button>
        <Button size="small" onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</Button>
        <Button size="small" onClick={() => {
          const url = window.prompt('Enter URL');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}>Link</Button>
        <Button size="small" onClick={() => {
          const url = window.prompt('Enter image URL');
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}>Image</Button>
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>{t('admin.title')}</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label={t('admin.users')} />
        <Tab label={t('admin.pages')} />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tab === 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.id_grid_users')}</TableCell>
                <TableCell>{t('admin.username_grid_users')}</TableCell>
                <TableCell>{t('admin.email_grid_users')}</TableCell>
                <TableCell>{t('admin.admin_grid_users')}</TableCell>
                <TableCell>{t('admin.actions_grid_users')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <TextField name="username" value={editUserForm.username} onChange={handleEditUserChange} size="small" />
                    ) : user.username}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <TextField name="email" value={editUserForm.email} onChange={handleEditUserChange} size="small" />
                    ) : user.email}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Checkbox name="is_admin" checked={editUserForm.is_admin} onChange={handleEditUserChange} />
                    ) : (user.is_admin ? 'Yes' : 'No')}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <>
                        <IconButton onClick={() => handleSaveUser(user.id)} color="primary"><SaveIcon /></IconButton>
                        <IconButton onClick={() => setEditUserId(null)} color="secondary"><CancelIcon /></IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => handleEditUser(user)} color="primary"><EditIcon /></IconButton>
                        <Button color="error" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {tab === 1 && (
          <>
            <Box sx={{ mb: 2 }}>
              <Button variant="contained" onClick={handleOpenCreatePageDialog} sx={{ mb: 2 }}>Create Page</Button>
            </Box>
            
            {/* Search and Filter Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField 
                label="Search pages" 
                value={pageSearch} 
                onChange={(e) => {
                  setPageSearch(e.target.value);
                  setAdminPageNumber(1);
                }} 
                size="small" 
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select 
                  value={pageStatusFilter} 
                  label="Status" 
                  onChange={(e) => {
                    setPageStatusFilter(e.target.value);
                    setAdminPageNumber(1);
                  }} 
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Sort By</InputLabel>
                <Select 
                  value={pageSort} 
                  label="Sort By" 
                  onChange={(e) => {
                    setPageSort(e.target.value);
                    setAdminPageNumber(1);
                  }} 
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="created_at_desc">Newest</MenuItem>
                  <MenuItem value="created_at_asc">Oldest</MenuItem>
                  <MenuItem value="title_asc">Title A-Z</MenuItem>
                  <MenuItem value="title_desc">Title Z-A</MenuItem>
                  <MenuItem value="author_asc">Author A-Z</MenuItem>
                  <MenuItem value="author_desc">Author Z-A</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Per Page</InputLabel>
                <Select 
                  value={itemsPerPage} 
                  label="Per Page" 
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setAdminPageNumber(1);
                  }} 
                  sx={{ minWidth: 100 }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Pagination Info */}
            {adminPagination.total > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Showing {((adminPagination.page - 1) * adminPagination.limit) + 1}-{Math.min(adminPagination.page * adminPagination.limit, adminPagination.total)} of {adminPagination.total} pages
              </Typography>
            )}
            
            <Dialog open={createPageDialogOpen} onClose={handleCloseCreatePageDialog} maxWidth="md" fullWidth>
              <DialogTitle>Create Page</DialogTitle>
              <DialogContent>
                <TextField label="Title" name="title" value={newPageForm.title} onChange={handleNewPageChange} fullWidth margin="normal" required />
                <TextField label="Slug" name="slug" value={newPageForm.slug} onChange={handleNewPageChange} fullWidth margin="normal" required />
                <TiptapToolbar editor={createEditor} />
                <EditorContent editor={createEditor} style={{ border: '1px solid #ccc', borderRadius: 4, minHeight: 150, marginBottom: 20, padding: 8 }} />
                <FormControlLabel control={<Checkbox name="status" checked={newPageForm.status === 'published'} onChange={(e) => setNewPageForm(f => ({ ...f, status: e.target.checked ? 'published' : 'draft' }))} />} label="Published" />
                {pageDialogError && <Alert severity="error" sx={{ mt: 1 }}>{pageDialogError}</Alert>}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseCreatePageDialog}>Cancel</Button>
                <Button onClick={handleCreatePageDialog} variant="contained" color="primary">Create</Button>
              </DialogActions>
            </Dialog>
            
            <Dialog open={editPageDialogOpen} onClose={handleEditPageDialogClose} maxWidth="md" fullWidth>
              <DialogTitle>Edit Page</DialogTitle>
              <DialogContent>
                <TextField label="Title" name="title" value={editPageForm.title} onChange={handleEditPageChange} fullWidth margin="normal" required />
                <TextField label="Slug" name="slug" value={editPageForm.slug} onChange={handleEditPageChange} fullWidth margin="normal" required />
                <TiptapToolbar editor={editEditor} />
                <EditorContent key={editPageId} editor={editEditor} style={{ border: '1px solid #ccc', borderRadius: 4, minHeight: 150, marginBottom: 20, padding: 8 }} />
                <FormControlLabel control={<Checkbox name="status" checked={editPageForm.status === 'published'} onChange={(e) => setEditPageForm(f => ({ ...f, status: e.target.checked ? 'published' : 'draft' }))} />} label="Published" />
                {pageDialogError && <Alert severity="error" sx={{ mt: 1 }}>{pageDialogError}</Alert>}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleEditPageDialogClose}>Cancel</Button>
                <Button onClick={handleSavePageDialog} variant="contained" color="primary">Save</Button>
              </DialogActions>
            </Dialog>
            
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('admin.id_grid_pages')}</TableCell>
                  <TableCell>{t('admin.title_grid_pages')}</TableCell>
                  <TableCell>{t('admin.slug_grid_pages')}</TableCell>
                  <TableCell>{t('admin.content_grid_pages')}</TableCell>
                  <TableCell>{t('admin.author_grid_pages')}</TableCell>
                  <TableCell>{t('admin.status_grid_pages')}</TableCell>
                  <TableCell>{t('admin.actions_grid_pages')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography>Loading...</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pages.map(page => (
                    <TableRow key={page.id}>
                      <TableCell>{page.id}</TableCell>
                      <TableCell>{page.title}</TableCell>
                      <TableCell>{page.slug}</TableCell>
                      <TableCell>
                        <div style={{ maxHeight: 80, overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: page.content }} />
                      </TableCell>
                      <TableCell>{page.author}</TableCell>
                      <TableCell>{page.status}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditPage(page)} color="primary"><EditIcon /></IconButton>
                        <Button color="error" onClick={() => handleDeletePage(page.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Pagination Controls */}
            {adminPagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination 
                  count={adminPagination.totalPages} 
                  page={adminPagination.page} 
                  onChange={(_, value) => {
                    setAdminPageNumber(value);
                  }} 
                  color="primary" 
                  showFirstButton 
                  showLastButton 
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default Admin; 
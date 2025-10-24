import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import { Container, Typography, Box, Alert, Button, TextField } from '@mui/material';

const Profile = () => {
  const { token, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      getProfile(token)
        .then(res => {
          setProfile(res.data);
          setForm({ username: res.data.username, email: res.data.email, password: '' });
        })
        .catch(() => setError('Failed to load profile'));
    }
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await updateProfile(token, form);
      setProfile(res.data);
      setUser(u => ({ ...u, username: res.data.username, email: res.data.email }));
      setSuccess('Profile updated!');
      setEdit(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>My Profile</Typography>
        {success && <Alert severity="success">{success}</Alert>}
        {edit ? (
          <>
            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="New Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              helperText="Leave blank to keep current password"
            />
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2, mr: 1 }}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => setEdit(false)} sx={{ mt: 2 }}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Typography><b>Username:</b> {profile.username}</Typography>
            <Typography><b>Email:</b> {profile.email}</Typography>
            <Typography><b>Admin:</b> {profile.is_admin ? 'Yes' : 'No'}</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => setEdit(true)}>
              Edit
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Profile; 
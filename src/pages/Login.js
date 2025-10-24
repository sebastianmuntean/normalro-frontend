import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';

const Login = () => {
  const { setUser, setToken } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(username, password);
      setUser(res.data.user);
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Don't have an account? <Link to="/register">Register</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 
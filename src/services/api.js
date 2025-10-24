import axios from 'axios';
import API_BASE_URL from '../config/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchTools = () => client.get('/tools');

export const generateSlug = (text) =>
  client.post('/tools/slug-generator', { text });

export const analyzeText = (text) =>
  client.post('/tools/word-counter', { text });

export const createPassword = (options) =>
  client.post('/tools/password-generator', { lowercase: true, ...options });

export const convertBase64 = (payload) =>
  client.post('/tools/base64-converter', payload);

export const generateCnp = (payload) =>
  client.post('/tools/cnp-generator', payload);

export const validateCnp = (cnp) =>
  client.post('/tools/cnp-validator', { cnp });
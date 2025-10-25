// You can set REACT_APP_API_URL in Vercel environment variables
let API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://backend.normal.ro'  // Backend pe domeniul normal.ro
    : 'http://localhost:5000');

// Remove trailing slash to avoid double slashes
API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');

// Ensure /api is always included (normalize)
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = `${API_BASE_URL}/api`;
}

export default API_BASE_URL; 
// You can set REACT_APP_API_URL in Vercel environment variables
let API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://backend.normal.ro/api'  // Backend pe domeniul normal.ro
    : 'http://localhost:5000/api');

// Remove trailing slash to avoid double slashes
API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');

export default API_BASE_URL; 
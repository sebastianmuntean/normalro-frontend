// You can set REACT_APP_API_URL in Vercel environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://YOUR-BACKEND-URL.vercel.app/api'  // Replace with your actual backend URL
    : 'http://localhost:5000/api');

export default API_BASE_URL; 
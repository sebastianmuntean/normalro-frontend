# Normal.ro Frontend

React frontend for normal.ro tools application.

## Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Available environment variables:

- `REACT_APP_API_URL` - Backend API URL (required)
  - Local: `http://localhost:5000`
  - Production: `https://api.normalro.ro`
  
- `REACT_APP_GOOGLE_CLIENT_ID` - Google Drive Client ID (optional)
  - Required for Google Drive integration in Invoice Generator
  - See `.env.example` for setup instructions
  
- `REACT_APP_DEFAULT_TVA` - Default VAT rate for invoices (optional, default: 21)
  - Common values: 21 (standard), 11 (reduced), 0 (exempt)

## Deploy to Vercel

1. Push to GitHub
2. Import on Vercel
3. Set environment variables:
   - `REACT_APP_API_URL` (required)
   - `REACT_APP_GOOGLE_CLIENT_ID` (optional)
   - `REACT_APP_DEFAULT_TVA` (optional)
4. Deploy

## Local Development

```bash
npm install
npm start
```

# 🚀 Deploy Frontend to Vercel

## Prerequisites

✅ Backend is deployed and working!
- Backend URL: `https://your-backend-url.vercel.app`

## 📤 Deploy Steps

### 1. Initialize Git Repository

```powershell
cd C:\Projects\normalro\_git\normalro-frontend

# Initialize git
git init
git add .
git commit -m "Initial frontend commit"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `normalro-frontend`
3. **DO NOT** initialize with README
4. Click "Create repository"

### 3. Push to GitHub

```powershell
git remote add origin https://github.com/YOUR-USERNAME/normalro-frontend.git
git branch -M main
git push -u origin main
```

### 4. Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "**Add New Project**"
3. Select `normalro-frontend` repository
4. Vercel should auto-detect **Create React App**
5. **Don't change any settings**
6. Click "**Deploy**"
7. Wait for deployment
8. **Copy the frontend URL**

### 5. Configure Frontend Environment Variable

1. In frontend Vercel project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-url.vercel.app/api`
3. Click "**Save**"
4. Go to **Deployments** → Click three dots → **Redeploy**

### 6. Update Backend CORS

1. Go to backend Vercel project → **Settings** → **Environment Variables**
2. Edit `ALLOWED_ORIGINS`:
   - **Value:** `https://your-frontend-url.vercel.app,http://localhost:3000`
3. Click "**Save**"
4. **Redeploy** backend

---

## ✅ Test Everything!

1. Visit your frontend: `https://your-frontend-url.vercel.app`
2. Try a tool (e.g., Word Counter, Slug Generator)
3. Everything should work! 🎉

---

## 🎯 Final Setup

### Your Deployed Apps:
- **Frontend:** `https://your-frontend-url.vercel.app`
- **Backend:** `https://your-backend-url.vercel.app`

### Environment Variables Summary:

**Backend:**
- `ALLOWED_ORIGINS` = `https://your-frontend-url.vercel.app,http://localhost:3000`

**Frontend:**
- `REACT_APP_API_URL` = `https://your-backend-url.vercel.app/api`

---

## 🛠️ Local Development

### Backend:
```powershell
cd normalro-backend
python app.py
# Runs on http://localhost:5000
```

### Frontend:
```powershell
cd normalro-frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## 🎉 Done!

Both apps are deployed and working together!


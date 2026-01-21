# Root directory setup guide
# Run both frontend and backend on the same port using a single command

## Setup Complete ✅

### Single Command to Run Everything:
```bash
npm run dev
```

This will:
- Start Backend on port 5000
- Start Frontend on port 3000
- Frontend proxies `/api/*` requests to backend

### How it Works:

1. **Frontend** (Next.js) runs on `http://localhost:3000`
2. **Backend** (Express) runs on `http://localhost:5000` 
3. **API Proxy**: Frontend routes `/api/*` → Backend `http://localhost:5000/api/*`

### From Frontend Code:
```javascript
// Just use relative paths - they automatically proxy to backend
fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
// Automatically becomes: http://localhost:5000/api/auth/login
```

### Install All Dependencies:
```bash
npm run install-all
```

### Other Commands:
```bash
npm run dev      # Start both (development)
npm start        # Start both (production)
```

## Architecture

```
Browser (localhost:3000)
    ↓
Next.js Frontend (port 3000)
    ├── Serves UI
    ├── Handles routes (/products, /dashboard, etc)
    └── Proxies /api/* → Backend
    
Express Backend (port 5000)
    ├── Handles /api/auth
    ├── Handles /api/products
    ├── Handles /api/categories
    └── Connected to MongoDB
```

## Benefits of This Setup

✅ Single command to run everything
✅ No CORS issues (same origin)
✅ Cleaner API calls from frontend
✅ Easy to deploy (frontend can serve backend files)
✅ Development mirrors production setup

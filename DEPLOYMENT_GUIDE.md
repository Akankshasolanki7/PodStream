# Podstream Deployment Guide

## Environment Variables Setup

### Frontend Environment Variables
The frontend now uses environment variables to handle API URLs dynamically.

**Local Development (.env):**
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_NODE_ENV=development
```

**Production (.env.production):**
```
VITE_API_BASE_URL=https://backend-one-wine-59.vercel.app/api/v1
VITE_NODE_ENV=production
```

### Backend Environment Variables
**Local Development (.env):**
```
PORT=5000
MONGO_URI=mongodb+srv://podstreamer8:podcast123@cluster0.7ljkfdb.mongodb.net/Podstream
JWT_SECRET=aka20990
NODE_ENV=development
FRONTEND_URL=https://frontend-khaki-ten-90.vercel.app
```

## Vercel Deployment Steps

### 1. Deploy Backend to Vercel

1. Navigate to the backend directory
2. Install Vercel CLI: `npm i -g vercel`
3. Login to Vercel: `vercel login`
4. Deploy: `vercel --prod`
5. Set environment variables in Vercel dashboard:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Your frontend Vercel URL (will be available after frontend deployment)

### 2. Deploy Frontend to Vercel

1. Navigate to the frontend directory
2. Update `.env.production` with your actual backend URL
3. Deploy: `vercel --prod`
4. Set environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL`: Your backend Vercel URL + /api/v1
   - `VITE_NODE_ENV`: production

### 3. Update CORS Configuration

After both deployments:
1. Update backend environment variable `FRONTEND_URL` with your frontend Vercel URL
2. Update the CORS configuration in `backend/app.js` if needed
3. Redeploy backend if necessary

## File Changes Made

### Frontend Changes:
- Created `frontend/src/config/api.js` for centralized API configuration
- Updated all components to use `API_BASE_URL` instead of hardcoded URLs
- Created environment files for development and production
- Added Vercel configuration files

### Backend Changes:
- Enhanced CORS configuration for production
- Added deployment scripts to package.json
- Updated environment variables
- Created Vercel configuration files

## Testing

1. Test locally with `npm run dev` (frontend) and `npm start` (backend)
2. Verify all API calls work correctly
3. Test authentication and file uploads
4. Verify CORS settings work in production

## Deployed URLs

### Production URLs:
- **Frontend**: https://frontend-khaki-ten-90.vercel.app
- **Backend**: https://backend-one-wine-59.vercel.app

## Notes

- File uploads may need additional configuration for Vercel (consider using cloud storage)
- Monitor Vercel function limits for the backend
- Environment variables are properly configured for both development and production
- CORS is configured to allow requests from the frontend domain

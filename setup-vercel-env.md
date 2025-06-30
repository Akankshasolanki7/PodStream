# Vercel Environment Variables Setup

## Problem Solved
The CORS loop issue has been fixed with a dynamic CORS configuration that accepts any Vercel deployment from your account.

## Current Deployment URLs
- **Backend**: https://backend-6iha97y28-akankshakhushi865-gmailcoms-projects.vercel.app
- **Frontend**: Use your stable URL: https://frontend-khaki-ten-90.vercel.app

## Recommended Setup for Stability

### Option 1: Use Vercel Environment Variables (Recommended)

1. **Backend Environment Variables** (Set in Vercel Dashboard):
   ```
   MONGO_URI=mongodb+srv://podstreamer8:podcast123@cluster0.7ljkfdb.mongodb.net/Podstream
   JWT_SECRET=aka20990
   NODE_ENV=production
   FRONTEND_URL=https://frontend-khaki-ten-90.vercel.app
   ```

2. **Frontend Environment Variables** (Set in Vercel Dashboard):
   ```
   VITE_API_BASE_URL=https://backend-one-wine-59.vercel.app/api/v1
   VITE_NODE_ENV=production
   ```

### Option 2: Use Custom Domains (Best for Production)

1. Set up custom domains in Vercel:
   - Backend: `api.yourapp.com`
   - Frontend: `yourapp.com`

2. Update environment variables to use custom domains

## Steps to Set Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your backend project
3. Go to Settings → Environment Variables
4. Add the variables listed above
5. Repeat for frontend project
6. Redeploy both projects

## Current CORS Configuration
The backend now uses dynamic CORS that accepts:
- Any localhost URL (for development)
- Any vercel.app domain from your account
- Your specific frontend domain

This eliminates the deployment loop issue!

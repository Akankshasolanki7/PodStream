# 🎵 Podstream - Full-Stack Podcast Platform

A modern podcast streaming platform with real-time audio playback, cloud storage, user management, and category-based content organization.

## 🚀 Live Demo
- **App**: [https://frontend-dyyxatrkm-akankshakhushi865-gmailcoms-projects.vercel.app](https://frontend-dyyxatrkm-akankshakhushi865-gmailcoms-projects.vercel.app)
- **API**: [https://backend-one-wine-59.vercel.app](https://backend-one-wine-59.vercel.app)

## ✨ Key Features
- **Global Audio Player** - Persistent player with controls, progress tracking, volume control
- **File Upload System** - Drag-and-drop with cloud storage and progress tracking
- **Authentication** - JWT-based with admin/user roles and secure sessions
- **Category System** - Organized content with real-time filtering and search
- **Responsive Design** - Mobile-first with smooth animations and loading states
- **Real-time Features** - Live likes, comments, view tracking, and notifications

## 🛠️ Tech Stack
**Frontend:** React 18, Redux Toolkit, Tailwind CSS, Framer Motion, React Router
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
**Cloud:** Vercel (Deployment), Cloudinary (Storage), MongoDB Atlas
**Tools:** Axios, React Toastify, React Dropzone, CORS, dotenv

## 📁 Project Structure
```
podstream/
├── frontend/                 # React App
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Route pages
│   │   ├── context/         # React Context
│   │   ├── store/           # Redux store
│   │   └── config/          # Configuration
│   └── package.json
├── backend/                 # Node.js API
│   ├── api/index.js        # Main API handler
│   ├── models/             # Database schemas
│   ├── services/           # Business logic
│   └── conn/               # DB connection
└── README.md
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v16+), MongoDB Atlas account, Cloudinary account (optional)

### Backend Setup
```bash
cd backend && npm install
```
Create `.env`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Frontend Setup
```bash
cd frontend && npm install
```
Create `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Run Development
```bash
# Backend: npm start
# Frontend: npm run dev
```

## 🎮 Usage

### Demo Credentials
**Admin:** Email: `root` | Password: `root`

### Features
- **Authentication** - Sign up/login with secure sessions
- **Upload Podcasts** - Drag-and-drop files with progress tracking
- **Browse Content** - Categories, search, and filtering
- **Audio Player** - Global player with controls and progress
- **Social Features** - Like, comment, and view tracking

## 🔐 Security & Performance

### Security Features
- **JWT Authentication** - Secure tokens with HTTP-only cookies
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Client and server-side validation
- **CORS Configuration** - Secure cross-origin requests
- **Role-Based Access** - Admin and user permissions

### Performance Optimizations
- **Code Splitting** - Reduced bundle size with dynamic imports
- **Lazy Loading** - On-demand component and image loading
- **Database Indexing** - Optimized MongoDB queries
- **Caching** - Browser and API response caching
- **Responsive Design** - Mobile-first with efficient rendering

## 📊 API Endpoints
```
# Authentication
POST /api/v1/sign-up          # User registration
POST /api/v1/sign-in          # User login
POST /api/v1/logout           # User logout

# Podcasts
GET  /api/v1/get-podcasts     # Get all podcasts (paginated)
POST /api/v1/add-podcast      # Create new podcast
POST /api/v1/like-podcast/:id # Like/unlike podcast

# Categories
GET  /api/v1/get-categories   # Get all categories
GET  /api/v1/category/:name   # Get podcasts by category

# File Upload
POST /api/v1/get-upload-url   # Get signed upload URL
```

## 🏗️ Architecture
- **Frontend:** React SPA with global state management
- **Backend:** Serverless API with MongoDB integration
- **Storage:** Cloudinary for files, MongoDB Atlas for data
- **Deployment:** Vercel for both frontend and backend
- **Security:** JWT authentication, input validation, CORS

## 🎯 Key Technical Achievements
- **Global Audio Player** - Persistent playback across pages
- **Real-time File Upload** - Progress tracking with cloud storage
- **Category System** - Smart filtering with case-insensitive search
- **Responsive Design** - Mobile-first with smooth animations
- **Security Implementation** - JWT, bcrypt, input validation
- **Performance Optimization** - Code splitting, lazy loading, caching

---

**Built with modern web technologies to demonstrate full-stack development expertise**

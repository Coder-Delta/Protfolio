# Ranjit's Portfolio

A modern, professional portfolio website built with Vue 3, Vite, Express.js, and PostgreSQL.

## 🎯 Project Overview

This is a full-stack portfolio application showcasing projects, skills, and experience. The frontend is a Vue 3 SPA with smooth animations, and the backend is a Node.js REST API with PostgreSQL for data persistence.

## 📊 Architecture

```
https://ranjitbhandary.me (Frontend)
        ↓
Vue 3 + Vite (SPA)
        ↓
REST API (Express.js)
        ↓
PostgreSQL Database
```

## 🛠 Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next-generation build tool
- **Vue Router** - Client-side routing
- **PicoCSS** - Minimal CSS framework
- **Custom CSS** - Scoped component styling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **express-validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Protfolio/
├── src/                          # Frontend source
│   ├── components/
│   │   └── Navbar.vue           # Navigation component
│   ├── Pages/
│   │   ├── Home.vue             # Home page (about)
│   │   └── Projects.vue         # Projects page (API-powered)
│   ├── services/
│   │   └── api.js               # API client layer
│   ├── routes/
│   │   └── index.js             # Vue Router config
│   ├── assets/                  # Static assets
│   ├── App.vue                  # Root component
│   └── main.js                  # Entry point
├── backend/                      # Backend source
│   ├── routes/                  # API routes
│   │   ├── projects.js          # Projects endpoints
│   │   └── contact.js           # Contact endpoints
│   ├── db/
│   │   ├── client.js            # PostgreSQL client
│   │   └── schema.sql           # Database schema
│   ├── scripts/
│   │   ├── migrate.js           # Run migrations
│   │   └── seed.js              # Seed data
│   ├── server.js                # Express server
│   ├── package.json             # Dependencies
│   ├── .env.example             # Environment template
│   └── README.md                # Backend docs
├── index.html                    # HTML entry point
├── vite.config.js               # Vite configuration
├── package.json                 # Frontend dependencies
├── .env.example                 # Frontend env template
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js v20+
- PostgreSQL 12+
- npm or bun

### 1. Setup Frontend

```bash
# Install dependencies
npm install
# or
bun install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install
# or
bun install

# Copy environment file
cp .env.example .env

# Configure PostgreSQL in .env
# DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db

# Run migrations and seed
npm run migrate:seed

# Start server
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Build for Production

```bash
# Frontend
npm run build

# Backend is ready to deploy as-is
```

## 📚 API Documentation

See [backend/README.md](backend/README.md) for complete API documentation.

### Main Endpoints

- `GET /api/health` - Health check
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/contact` - Submit contact message

## 🗄 Database Setup

### Create Database

```bash
createdb portfolio_db
```

### Run Migrations

```bash
cd backend
npm run migrate
```

### Seed Data

```bash
npm run seed
```

### View Data

```bash
psql portfolio_db

# List all projects
SELECT * FROM projects ORDER BY featured DESC, display_order ASC;

# List all messages
SELECT * FROM messages ORDER BY created_at DESC;
```

## 🔧 Configuration

### Frontend Environment Variables

Create `.env` in the root directory:

```env
# Development
VITE_API_BASE_URL=http://localhost:5000/api

# Production (during build)
# VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Backend Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (use https://ranjitbhandary.me in production)
FRONTEND_URL=http://localhost:5173
```

## 🎨 Design System

- **Colors**: Professional dark theme (#1a1a1a, #4a4a4a)
- **Typography**: System fonts + Courier New for code
- **Spacing**: Consistent rem-based spacing
- **Animations**: Smooth cubic-bezier transitions
- **Responsive**: Mobile-first approach with fluid typography

## ✨ Features

### Current Features
- ✅ Home page with collapsible about sections
- ✅ Projects page with pagination (4 items per page)
- ✅ Project cards with GitHub preview images
- ✅ Smooth page transitions
- ✅ Social media links (GitHub, LinkedIn, Hashnode, Email)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading states for images
- ✅ Fallback states for missing images

### Backend Features
- ✅ REST API with Express.js
- ✅ PostgreSQL database
- ✅ Input validation
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ Error handling
- ✅ Database migrations and seeding

## 📱 Responsive Breakpoints

- **Mobile**: < 375px
- **Mobile**: 375px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

## 🧪 Testing

### Frontend Health Check

```bash
curl http://localhost:5173
```

### Backend Health Check

```bash
curl http://localhost:5000/api/health
```

### Get All Projects

```bash
curl http://localhost:5000/api/projects
```

### Submit Contact Message

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "message": "This is a test message for the contact form."
  }'
```

## 🌐 Production Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variable: `VITE_API_BASE_URL=https://api.yourdomain.com/api`
4. Deploy

### Backend (Vercel, Heroku, AWS, etc.)

1. Set environment variables:
   - `DATABASE_URL` - Production PostgreSQL connection
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://ranjitbhandary.me`

2. Deploy Node.js server

3. Update frontend API URL to production backend

### CORS Configuration

Backend automatically configures CORS based on environment:
- **Development**: `http://localhost:5173`
- **Production**: `https://ranjitbhandary.me`

## 📖 Additional Resources

- [Backend API Documentation](backend/README.md)
- [Vue.js Documentation](https://vuejs.org/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vite Guide](https://vitejs.dev/)

## 🔐 Security

- ✅ Environment variables for sensitive data
- ✅ Parameterized queries (no SQL injection)
- ✅ Input validation and sanitization
- ✅ CORS restrictions
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ Safe error messages in production
- ✅ No database credentials in frontend

## 📝 License

Ranjit Bhandary © 2024

## 🤝 Contact

- Website: [ranjitbhandary.me](https://ranjitbhandary.me)
- GitHub: [@Coder-Delta](https://github.com/Coder-Delta)
- LinkedIn: [ranjit-kumar-702054258](https://linkedin.com/in/ranjit-kumar-702054258)
- Email: [ranjitbhandary15@gmail.com](mailto:ranjitbhandary15@gmail.com)

---

## 📋 Development Notes

### Existing Features Preserved
- All 21 projects from original hardcoded data
- Original navigation and branding
- Original animations and transitions
- Original responsive design
- Original color scheme

### New Features Added
- Backend REST API
- PostgreSQL database
- API service layer
- Loading/error states
- Production-ready setup

### Future Enhancements
- [ ] Add database-backed sections only when corresponding portfolio content is added
- [ ] Admin panel for managing content
- [ ] Email notifications for contact messages
- [ ] Caching layer (Redis)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Authentication system

# Portfolio Backend API

A Node.js + Express REST API for Ranjit's Portfolio with PostgreSQL database.

## Anonymous Analytics

The `/api/analytics` routes are independent from the portfolio APIs. They accept only opted-in, anonymous telemetry and are rate-limited separately. No IP address, raw user-agent, contact data, or browser fingerprint is persisted. Coarse location is read only from trusted deployment headers (such as Vercel's country/region/city headers), if available.

Set these backend-only environment variables before enabling the private dashboard:

```env
ANALYTICS_ADMIN_PASSWORD=a-long-unique-password
ANALYTICS_ADMIN_TOKEN_SECRET=a-separate-long-random-secret
```

Public, best-effort endpoints are `POST /api/analytics/session`, `/page-view`, `/project-view`, `/event`, and `/session-end`. Dashboard data is available only through `GET /api/analytics/admin/summary` with an authenticated bearer token from `POST /api/analytics/admin/login`.

## Architecture

```
Frontend (Vue 3 + Vite)
    ↓
REST API (Express.js)
    ↓
PostgreSQL Database
```

## Tech Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator
- **Environment**: dotenv

## Setup

### Prerequisites

- Node.js v20 or higher
- PostgreSQL 12 or higher
- npm or bun package manager

### 1. Install Dependencies

```bash
cd backend
npm install
# or
bun install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Local PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Optional: increases GitHub API rate limits for automatic public-repository discovery
GITHUB_USERNAME=Coder-Delta
GITHUB_TOKEN=
GITHUB_SYNC_INTERVAL_MS=300000

# Use FRONTEND_URL=https://ranjitbhandary.me in production.
```

### 3. Setup PostgreSQL Database

Create a new PostgreSQL database:

```bash
createdb portfolio_db
```

Or using psql:

```sql
CREATE DATABASE portfolio_db;
```

### 4. Run Migrations

Initialize the database schema:

```bash
npm run migrate
```

### 5. Seed Initial Data

Populate with existing projects:

```bash
npm run seed
```

Or run both in one command:

```bash
npm run migrate:seed
```

### 6. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

---

## API Documentation

### Response Format

All responses follow a consistent JSON structure:

**Success:**
```json
{
  "success": true,
  "data": []
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

### Endpoints

#### GET /api/health

Health check endpoint.

**Response (200 OK):**
```json
{
  "success": true,
  "data": { "status": "ok", "timestamp": "2024-01-15T10:30:00.000Z" }
}
```

---

#### GET /api/projects

Get all projects. Before reading the database, the API discovers newly created public, non-fork GitHub repositories for `GITHUB_USERNAME` and inserts only repositories not already present. Existing curated project descriptions, order, and featured status are never overwritten. By default, GitHub is checked at most once every five minutes per running API instance.

**Query Parameters:**
- None

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "VideoTube Backend",
      "description": "Backend for a video platform with uploads, processing, auth, and streaming-focused APIs.",
      "repo": "videotube_backend",
      "featured": true,
      "display_order": 1,
      "created_at": "2024-01-15T10:30:00.000Z",
      "link": "https://github.com/Coder-Delta/videotube_backend",
      "image": "https://opengraph.githubassets.com/1/Coder-Delta/videotube_backend"
    }
  ]
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Failed to fetch projects"
}
```

---

#### GET /api/projects/:id

Get a single project by ID.

**URL Parameters:**
- `id` (integer, required): Project ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "VideoTube Backend",
    "description": "Backend for a video platform...",
    "repo": "videotube_backend",
    "featured": true,
    "display_order": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "link": "https://github.com/Coder-Delta/videotube_backend",
    "image": "https://opengraph.githubassets.com/1/Coder-Delta/videotube_backend"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Project not found"
}
```

---

#### POST /api/contact

Submit a contact message.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Great Portfolio",
  "message": "I was impressed with your projects and would like to discuss opportunities."
}
```

**Validation Rules:**
- `name`: Required, 2-255 characters
- `email`: Required, valid email format
- `subject`: Required, 3-255 characters
- `message`: Required, minimum 10 characters

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Message received successfully",
  "data": {
    "id": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error (400 - Validation Failed):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "param": "email",
      "msg": "Invalid email address"
    }
  ]
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Failed to send message"
}
```

---

## Database Schema

### projects

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| title | VARCHAR(255) | Project title, unique |
| description | TEXT | Project description |
| repo | VARCHAR(255) | GitHub repository name, unique |
| featured | BOOLEAN | Featured on homepage |
| display_order | INTEGER | Display order (1-based) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### messages

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Sender name |
| email | VARCHAR(255) | Sender email |
| subject | VARCHAR(255) | Message subject |
| message | TEXT | Message content |
| read | BOOLEAN | Read status (default: false) |
| created_at | TIMESTAMP | Creation timestamp |

---

## Security Features

✅ **Helmet** - Secure HTTP headers
✅ **CORS** - Controlled cross-origin access
✅ **Rate Limiting** - 100 requests per 15 minutes per IP
✅ **Input Validation** - express-validator on all inputs
✅ **Parameterized Queries** - SQL injection protection
✅ **Environment Variables** - No hardcoded credentials
✅ **Error Handling** - Safe error messages in production

---

## Development vs Production

### Environment Variables

**Development (.env):**
```
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Production (.env):**
```
NODE_ENV=production
FRONTEND_URL=https://ranjitbhandary.me
```

### Behavior Differences

- **All environments**: Safe error messages only; implementation details remain server-side.

---

## Deployment

### Prerequisites for Production

1. PostgreSQL database on production server
2. Set environment variables on hosting platform
3. Ensure `NODE_ENV=production`
4. Whitelist production frontend URL in CORS

### Example Environment Variables (Production)

```env
DATABASE_URL=postgresql://prod_user:secure_password@prod-db.example.com:5432/portfolio_prod
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://ranjitbhandary.me
```

### Deploy to Vercel

1. Create `vercel.json` in backend root
2. Push to GitHub
3. Connect repository to Vercel
4. Set environment variables in Vercel dashboard
5. Deploy

---

## Local Testing

### Test Projects Endpoint

```bash
curl http://localhost:5000/api/projects
```

### Test Health Endpoint

```bash
curl http://localhost:5000/api/health
```

### Test Contact Endpoint

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message for the contact form."
  }'
```

---

## Database Management

### View All Projects

```bash
psql portfolio_db
```

```sql
SELECT * FROM projects ORDER BY featured DESC, display_order ASC;
```

### View All Messages

```sql
SELECT * FROM messages ORDER BY created_at DESC;
```

### Mark Message as Read

```sql
UPDATE messages SET read = true WHERE id = 1;
```

---

## Troubleshooting

### Database Connection Error

Check:
1. PostgreSQL is running
2. `DATABASE_URL` in `.env` is correct
3. Database exists: `psql -l`

### Port Already in Use

Change `PORT` in `.env` or kill the process:

```bash
lsof -i :5000
kill -9 <PID>
```

### CORS Errors

Ensure:
1. `FRONTEND_URL` matches your frontend domain
2. Frontend is using correct API URL
3. Server is restarted after env changes

---

## Future Enhancements

- [ ] Add APIs only when their corresponding portfolio sections exist
- [ ] Add authentication for admin panel
- [ ] Add email notifications for contact messages
- [ ] Add caching layer (Redis)
- [ ] Add database backups
- [ ] Add API logging and monitoring

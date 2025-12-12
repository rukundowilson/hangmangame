# Deployment Guide for Render

## Frontend Deployment (Next.js)

### Option 1: Using Render Dashboard (Recommended)

1. Go to your Render dashboard
2. Create a new **Web Service**
3. Connect your GitHub repository
4. **Important**: Set the **Root Directory** to `hangman-game`
5. Configure the following:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Node Version**: 22.16.0 (or latest)

### Option 2: Using render.yaml

The `render.yaml` file in the root directory should automatically configure both services. Make sure to:

1. Set environment variables in Render dashboard:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL (e.g., `https://your-backend.onrender.com`)

### Environment Variables for Frontend

- `NEXT_PUBLIC_API_URL` - Backend API URL (required)

## Backend Deployment (Express.js)

1. Create a new **Web Service** in Render
2. Set the **Root Directory** to `backend-server`
3. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Node Version**: 22.16.0 (or latest)

### Environment Variables for Backend

- `DB_HOST` - Database host
- `DB_USER` - Database user
- `DB_PASS` - Database password
- `DB_NAME` - Database name
- `PORT` - Server port (default: 5000)

### Database Setup

After deploying the backend, run the database setup:

```bash
npm run setup-db
```

Or manually execute the SQL from `backend-server/src/database/schema.sql`

## Troubleshooting

If you see "Missing script: build" error:
- Make sure the **Root Directory** is set to `hangman-game` in Render dashboard
- Or use the `render.yaml` configuration file

# Backend API Setup

## Overview

The frontend now uses the backend server API instead of Next.js API routes. All database operations are handled through the backend server.

## Backend Server Configuration

### 1. Start the Backend Server

Navigate to the `backend-server` directory and start the server:

```bash
cd backend-server
npm install  # If not already done
node server.js
```

The server will run on `http://localhost:8080` by default (or the port specified in `PORT` environment variable).

### 2. Environment Variables

Create a `.env` file in the `backend-server` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=hangman_game
PORT=8080
```

### 3. Frontend Configuration

Add the backend API URL to your `.env.local` file in the `hangman-game` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

If not set, it defaults to `http://localhost:8080`.

## API Endpoints

### User Registration
- **POST** `http://localhost:8080/api/users/register`
- Automatically called when a user signs up or signs in

### Get User Statistics
- **GET** `http://localhost:8080/api/users/stats?firebase_uid={uid}`
- Returns user's game statistics

### Record Game Result
- **POST** `http://localhost:8080/api/games/record`
- Records game result and updates statistics

## Database Schema

Make sure you've created the database tables. The schema SQL file should be in the backend-server directory or you can create the tables manually based on the schema defined in the backend controllers.

## Notes

- The backend server must be running for the frontend to work properly
- All database operations are now handled by the backend
- CORS is enabled to allow frontend requests


# Environment Variables Setup

## Create .env File

Create a `.env` file in the `backend-server` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_actual_password_here
DB_NAME=hangman_game

# Server Configuration
PORT=8080
```

## Important Notes

1. **Replace `your_actual_password_here`** with your actual MySQL root password
2. Make sure the database `hangman_game` exists (or change `DB_NAME` to your database name)
3. The `.env` file should be in the `backend-server` root directory (same level as `server.js`)

## Verify Setup

After creating the `.env` file, restart the server. You should see:
- ✅ Connected to MySQL database
- Database: hangman_game on localhost

If you see connection errors, check:
- MySQL server is running
- Database credentials are correct
- Database exists (create it with: `CREATE DATABASE hangman_game;`)


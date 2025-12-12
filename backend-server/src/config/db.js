import mysql from 'mysql2';
import dotenv from 'dotenv';

// Load environment variables - dotenv will automatically look for .env in:
// 1. Current working directory (where you run the command)
// 2. Parent directories
dotenv.config();

// Debug: Log if env vars are loaded (without showing password)
console.log('🔍 Environment check:', {
  DB_HOST: process.env.DB_HOST || 'NOT SET',
  DB_USER: process.env.DB_USER || 'NOT SET',
  DB_PASS: process.env.DB_PASS ? '***SET***' : 'NOT SET',
  DB_NAME: process.env.DB_NAME || 'NOT SET'
});

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('📝 Please create a .env file in the backend-server directory with:');
  console.error('   DB_HOST=localhost');
  console.error('   DB_USER=root');
  console.error('   DB_PASS=your_password');
  console.error('   DB_NAME=hangman_game');
  process.exit(1);
}

// Create a connection pool instead of single connection
// This handles connection lifecycle better and prevents "connection closed" errors
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'hangman_game',
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, // Unlimited queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  reconnect: true,
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('📝 Check your .env file in backend-server directory');
    console.error(`   Current config: host=${process.env.DB_HOST}, user=${process.env.DB_USER}, database=${process.env.DB_NAME}`);
    process.exit(1); // Stop the server if DB fails
  } else {
    console.log('✅ Connected to MySQL database');
    console.log(`   Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
    connection.release(); // Release the connection back to the pool
  }
});

// Handle pool errors
db.on('error', (err) => {
  console.error('❌ Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to database...');
  } else {
    throw err;
  }
});

export default db;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables first
// dotenv will look for .env in the current working directory
dotenv.config();

// Import db after environment variables are loaded

// Import db after environment variables are loaded
import db from './src/config/db.js';

// Import routes
import userRoutes from './src/routes/userRoutes.js';
import gameRoutes from './src/routes/gameRoutes.js';
import wordBankRoutes from './src/routes/wordBankRoutes.js';

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/wordbanks', wordBankRoutes);

// Database health check
db.query('SELECT 1 + 1 AS result', (err, results) => {
  if (err) {
    console.error('❌ Database health check failed:', err.message);
  } else {
    console.log('✅ Database is healthy. Test query result:', results[0].result);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
  console.log(`📊 Hangman Game API available at http://localhost:${port}/api`);
  console.log(`🏥 Health check available at http://localhost:${port}/health`);
});
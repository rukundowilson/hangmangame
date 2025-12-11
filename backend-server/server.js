import express from 'express';
import cors from 'cors';
import db from './src/config/db.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Import routes


// Import middleware


const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(corsHandler);
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


// Database health check
db.query('SELECT 1 + 1 AS result', (err, results) => {
  if (err) {
    console.error('❌ Database health check failed:', err.message);
  } else {
    console.log('✅ Database is healthy. Test query result:', results[0].result);
  }
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
  console.log(`📊 Stock Management API available at http://localhost:${port}/api`);
  console.log(`🏥 Health check available at http://localhost:${port}/health`);
});
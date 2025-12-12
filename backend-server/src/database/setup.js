import mysql from 'mysql2';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME,
  multipleStatements: true // Allow multiple SQL statements
});

// Read SQL file
const sqlPath = join(__dirname, 'schema.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

console.log('📊 Setting up database tables...');
console.log(`   Database: ${process.env.DB_NAME}`);
console.log(`   Host: ${process.env.DB_HOST}`);

// Connect and execute SQL
connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Connected to database');

  // Execute SQL statements
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error creating tables:', err.message);
      connection.end();
      process.exit(1);
    }

    console.log('✅ Database tables created successfully!');
    console.log('   - users table');
    console.log('   - game_stats table');
    console.log('   - game_history table');
    
    connection.end();
    process.exit(0);
  });
});



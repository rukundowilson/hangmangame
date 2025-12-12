# Database Setup Instructions

## Quick Setup

Run the database setup script:

```bash
npm run setup-db
```

This will automatically create all required tables in your database.

## Manual Setup

Alternatively, you can run the SQL schema manually:

```bash
mysql -u root -p your_database_name < src/database/schema.sql
```

Or connect to MySQL and run the SQL from `src/database/schema.sql`:

```sql
-- Copy and paste the contents of src/database/schema.sql
```

## Tables Created

1. **users** - Stores user information linked to Firebase authentication
2. **game_stats** - Stores aggregated game statistics per user
3. **game_history** - Stores detailed history of each game played (optional)

## Verify Setup

After running the setup, you can verify the tables exist:

```sql
USE your_database_name;
SHOW TABLES;
```

You should see:
- users
- game_stats
- game_history



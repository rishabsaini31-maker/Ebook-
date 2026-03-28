const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings optimized for Neon free tier (10 max connections)
  max: 5, // Maximum connections in pool (leaving room for other processes)
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Timeout when connecting after 10 seconds
  // Neon-specific: use ssl
  ssl: process.env.DATABASE_URL?.includes("neon.tech")
    ? { rejectUnauthorized: true }
    : false,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== "production") {
    process.exit(-1);
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await pool.end();
  console.log("Database pool closed");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await pool.end();
  console.log("Database pool closed");
  process.exit(0);
});

// Create tables
const createTables = async () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password_hash VARCHAR(255),
      google_id VARCHAR(255) UNIQUE,
      profile_image TEXT,
      auth_provider VARCHAR(20) DEFAULT 'local',
      is_premium BOOLEAN DEFAULT FALSE,
      premium_plan VARCHAR(20),
      premium_expiry DATE,
      monthly_entries_count INTEGER DEFAULT 0,
      last_entry_reset DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const salesTable = `
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      upi_amount DECIMAL(10,2) DEFAULT 0,
      cash_amount DECIMAL(10,2) DEFAULT 0,
      card_amount DECIMAL(10,2) DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const expensesTable = `
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT,
      period VARCHAR(20) DEFAULT 'daily',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const pendingPaymentsTable = `
    CREATE TABLE IF NOT EXISTS pending_payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      customer_name VARCHAR(100) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      due_date DATE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const loansTable = `
    CREATE TABLE IF NOT EXISTS loans (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      lender_name VARCHAR(100) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      paid_amount DECIMAL(10,2) DEFAULT 0,
      start_date DATE NOT NULL,
      due_date DATE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(usersTable);
    await pool.query(salesTable);
    await pool.query(expensesTable);
    await pool.query(pendingPaymentsTable);
    await pool.query(loansTable);

    // Add premium columns if they don't exist (for existing databases)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_premium') THEN
          ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'premium_plan') THEN
          ALTER TABLE users ADD COLUMN premium_plan VARCHAR(20);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'premium_expiry') THEN
          ALTER TABLE users ADD COLUMN premium_expiry DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'monthly_entries_count') THEN
          ALTER TABLE users ADD COLUMN monthly_entries_count INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_entry_reset') THEN
          ALTER TABLE users ADD COLUMN last_entry_reset DATE DEFAULT CURRENT_DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'period') THEN
          ALTER TABLE expenses ADD COLUMN period VARCHAR(20) DEFAULT 'daily';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'upi_amount') THEN
          ALTER TABLE sales ADD COLUMN upi_amount DECIMAL(10,2) DEFAULT 0;
          ALTER TABLE sales ADD COLUMN cash_amount DECIMAL(10,2) DEFAULT 0;
          ALTER TABLE sales ADD COLUMN card_amount DECIMAL(10,2) DEFAULT 0;
          
          UPDATE sales SET upi_amount = amount WHERE payment_mode = 'upi';
          UPDATE sales SET cash_amount = amount WHERE payment_mode = 'cash';
          UPDATE sales SET card_amount = amount WHERE payment_mode = 'card';
          
          ALTER TABLE sales DROP COLUMN IF EXISTS payment_mode;
        END IF;
      END $$;
    `);

    console.log("Tables created or already exist");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
};

createTables();

module.exports = pool;

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Without DATABASE_URL, `pg` silently falls back to localhost:5432, which is
  // exactly what causes "ECONNREFUSED 127.0.0.1:5432" in production. Report it
  // clearly as a deployment configuration issue instead of hiding it.
  console.error(
    'DATABASE_URL is not set. Set the DATABASE_URL environment variable in Vercel ' +
    'to your hosted PostgreSQL connection string (e.g. Supabase, Neon, RDS). ' +
    'Without it the app will attempt to connect to localhost:5432, which fails in production.'
  );
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();
export default pool;

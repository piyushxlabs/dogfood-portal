// lib/db.ts
// PostgreSQL connection client singleton using postgres.js
// Authoritative specification: DATA-MODEL.md & ARCHITECTURE.md

import postgres from 'postgres';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://dogfood_user:dogfood_secure_password_local@localhost:5432/dogfood_db';

// Maintain singleton instance across Next.js development hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __db_sql: postgres.Sql | undefined;
}

const sql =
  globalThis.__db_sql ||
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {}, // Suppress notice noise in air-gapped logs
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__db_sql = sql;
}

export default sql;
export { sql };

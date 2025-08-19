// src/config/db.js
import mysql from 'mysql2/promise';
import { DB } from './env.js';

const base = {
  host: DB.host,
  port: DB.port,
  user: DB.user,
  password: DB.password,
  database: DB.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(DB.ssl ? { ssl: DB.ssl } : {}), // sólo si pediste SSL por env
};

export const pool = mysql.createPool(base);

export async function testConnection() {
  // Podés usar ping (rápido y claro):
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }

  // Alternativa (tu versión):
  // const [rows] = await pool.query('SELECT 1 + 1 AS result');
  // return rows?.[0]?.result === 2;
}

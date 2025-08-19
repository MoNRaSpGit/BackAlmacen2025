// src/config/env.js
export const PORT = Number(process.env.PORT || 3001);

export const DB = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  ssl: process.env.DB_SSL === '1',   // poné DB_SSL=1 si tu proveedor requiere SSL
};

export const CORS_ORIGIN =
  process.env.CORS_ORIGIN || 'https://monraspgit.github.io,http://localhost:5173';

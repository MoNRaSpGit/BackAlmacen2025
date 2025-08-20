import 'dotenv/config';

export const PORT = process.env.PORT || 3001;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

export const DB = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Si tu instancia requiere SSL, descomentá esto:
  // ssl: { rejectUnauthorized: true },
};

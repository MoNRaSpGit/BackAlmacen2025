// src/app.js
import express from 'express';
import cors from 'cors';

// Rutas
import productsRouter from './routes/products.js';
import usersRouter from './routes/users.js';

const app = express();

// 🔹 Orígenes permitidos (Pages + localhost)
const ORIGINS =
  (process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean)) ||
  ['https://monraspgit.github.io', 'http://localhost:5173'];

// 🔹 Middleware CORS
app.use(cors({
  origin: ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // opcional si usás cookies/sesiones
}));

// Aceptar JSON “grande” (imagenes base64)
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

// Rutas
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);

// Healthcheck para Render
app.get('/api/health', (_req, res) => res.json({ ok: true }));

export default app;

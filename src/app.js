// src/app.js
import express from 'express';
import cors from 'cors';

// Rutas
import productsRouter from './routes/products.js';

const app = express();

// Permitir tu Pages + local dev
const ORIGINS =
  (process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean)) ||
  ['https://monraspgit.github.io', 'http://localhost:5173'];

app.use(cors({ origin: ORIGINS }));

// Aceptar JSON “grande” (imagenes base64)
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

// Healthcheck para Render
app.get('/api/health', (_req, res) => res.json(true));

// API
app.use('/api/products', productsRouter);

export default app;

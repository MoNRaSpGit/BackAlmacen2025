// src/index.js
import app from './app.js';
import { PORT as CONFIG_PORT } from './config/env.js';
import { testConnection, pool } from './config/db.js';

const PORT = Number(process.env.PORT || CONFIG_PORT || 3001);

// Arrancamos el server inmediatamente (Render necesita que escuche rápido)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API lista en :${PORT} (NODE_ENV=${process.env.NODE_ENV || 'dev'})`);
});

// Ping a la DB en segundo plano (no bloquea el arranque)
testConnection()
  .then(ok => console.log(ok ? '✅ DB conectada' : '⚠️ DB no respondió al ping'))
  .catch(e => console.error('❌ Error conectando a DB:', e?.message || e));

// Apagado limpio (Render manda SIGTERM en deploys/restarts)
let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('🛑 Cerrando servidor...');
  try {
    await new Promise(res => server.close(res));
    if (pool?.end) await pool.end();
  } catch (e) {
    console.error('Error al cerrar:', e);
  } finally {
    process.exit(0);
  }
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

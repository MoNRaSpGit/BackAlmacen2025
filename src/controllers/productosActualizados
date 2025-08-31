// server/src/controllers/productosActualizados.js
import { pool } from '../config/db.js';

function ensureDataUri(img) {
  if (!img) return null;
  if (img.startsWith('data:')) return img;
  const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(img) && img.length > 100;
  return looksBase64 ? `data:image/webp;base64,${img}` : img;
}

function sanitizeBarcode(code = '') {
  const raw = String(code ?? '');
  const trimmed = raw.trim();
  const digitsOnly = trimmed.replace(/\D+/g, '');
  return { trimmed, digitsOnly };
}

// GET /api/productos-actualizados
export async function listProducts(req, res) {
  try {
    const q = (req.query.q || '').trim();
    const limit = parseInt(req.query.limit || '60', 10);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const offset = (page - 1) * limit;

    let where = "";
    let params = [];
    if (q) {
      const like = `%${q}%`;
      where = "WHERE name LIKE ? OR barcode LIKE ?";
      params = [like, like];
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM products ${where}`, params
    );

    const [rows] = await pool.query(
      `SELECT id, name, price, stock, image, barcode, description
       FROM products
       ${where}
       ORDER BY name ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const items = rows.map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      stock: r.stock,
      barcode: r.barcode,
      description: r.description,
      image_url: ensureDataUri(r.image),
    }));

    res.json({ total, items });
  } catch (err) {
    console.error('listProducts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/productos-actualizados/by-barcode/:code
export async function getProductByBarcode(req, res) {
  try {
    const { trimmed, digitsOnly } = sanitizeBarcode(req.params.code || "");
    if (!trimmed) return res.status(404).json({ error: "Not found" });

    let [rows] = await pool.query(
      `SELECT id, name, price, stock, image, barcode, description
       FROM products WHERE barcode = ? LIMIT 1`,
      [trimmed]
    );

    if (!rows.length && digitsOnly) {
      [rows] = await pool.query(
        `SELECT id, name, price, stock, image, barcode, description
         FROM products
         WHERE REPLACE(REPLACE(REPLACE(REPLACE(barcode,' ', ''), '\r',''), '\n',''), '\t','') = ?
         LIMIT 1`,
        [digitsOnly]
      );
    }

    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const r = rows[0];
    res.json({
      id: r.id,
      name: r.name,
      price: Number(r.price) ?? 0,
      stock: Number(r.stock) ?? 0,
      barcode: r.barcode || trimmed,
      description: r.description || "",
      image_url: ensureDataUri(r.image),
    });
  } catch (err) {
    console.error("getProductByBarcode error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// GET /api/productos-actualizados/:id
export async function getProductById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id inválido' });
    }

    const [rows] = await pool.query(
      `SELECT id, name, price, stock, image, barcode, description
       FROM products WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const r = rows[0];
    res.json({
      id: r.id,
      name: r.name,
      price: r.price,
      stock: r.stock,
      barcode: r.barcode,
      description: r.description,
      image_url: ensureDataUri(r.image),
    });
  } catch (err) {
    console.error('getProductById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

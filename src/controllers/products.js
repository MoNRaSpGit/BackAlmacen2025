// server/src/controllers/products.js
import { pool } from '../config/db.js';

/** Normaliza la imagen a data-URI si hace falta */
function ensureDataUri(img) {
  if (!img) return null;
  if (img.startsWith('data:')) return img;
  const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(img) && img.length > 100;
  return looksBase64 ? `data:image/webp;base64,${img}` : img;
}

/** Limpia el código para búsquedas robustas */
function sanitizeBarcode(code = '') {
  const raw = String(code ?? '');
  const trimmed = raw.trim();
  const digitsOnly = trimmed.replace(/\D+/g, '');
  return { trimmed, digitsOnly };
}

// GET /api/products?q=cola&limit=60&page=1
export async function listProducts(req, res) {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit || '60', 10), 200);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const offset = (page - 1) * limit;

    const base = `
      SELECT id, name, price, stock, image, barcode, description
      FROM products
    `;

    let sql, params;
    if (q) {
      const like = `%${q}%`;
      sql = `${base}
             WHERE name LIKE ? OR barcode LIKE ?
             ORDER BY name ASC
             LIMIT ? OFFSET ?`;
      params = [like, like, limit, offset];
    } else {
      sql = `${base} ORDER BY name ASC LIMIT ? OFFSET ?`;
      params = [limit, offset];
    }

    const [rows] = await pool.query(sql, params);
    const out = rows.map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      stock: r.stock,
      barcode: r.barcode,
      description: r.description,
      image_url: ensureDataUri(r.image),
    }));
    res.json(out);
  } catch (err) {
    console.error('listProducts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/products/by-barcode/:code?soft=1
export async function getProductByBarcode(req, res) {
  try {
    const { trimmed, digitsOnly } = sanitizeBarcode(req.params.code);
    const soft = req.query.soft === '1';

    let [rows] = await pool.query(
      `SELECT id, name, price, stock, image, barcode, description
       FROM products WHERE barcode = ? LIMIT 1`,
      [trimmed]
    );

    if (!rows.length) {
      [rows] = await pool.query(
        `SELECT id, name, price, stock, image, barcode, description
         FROM products
         WHERE REPLACE(REPLACE(REPLACE(REPLACE(barcode,' ', ''), '\r',''), '\n',''), '\t','') = ?
         LIMIT 1`,
        [digitsOnly]
      );
    }

    if (!rows.length) {
      if (soft) return res.json({ found: false });
      return res.status(404).json({ error: 'Not found' });
    }

    const r = rows[0];
    return res.json({
      id: r.id,
      name: r.name,
      price: r.price,
      stock: r.stock,
      barcode: r.barcode,
      description: r.description,
      image_url: ensureDataUri(r.image),
    });
  } catch (err) {
    console.error('getProductByBarcode error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/products/:id
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

// PUT /api/products/:id/image  (responde 204)
export async function updateProductImage(req, res) {
  try {
    const id = Number(req.params.id);
    const imageDataUrl = String(req.body?.imageDataUrl || '');

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id inválido' });
    }
    if (!imageDataUrl) {
      return res.status(400).json({ error: 'imageDataUrl requerido' });
    }
    if (!imageDataUrl.startsWith('data:') || !imageDataUrl.includes(';base64,')) {
      return res.status(400).json({ error: 'imageDataUrl debe ser data URI base64 (data:image/...;base64,...)' });
    }
    if (imageDataUrl.length > 10_000_000) {
      return res.status(413).json({ error: 'imagen demasiado grande (>10MB)' });
    }

    await pool.query(`UPDATE products SET image = ? WHERE id = ?`, [imageDataUrl, id]);
    return res.status(204).end();
  } catch (err) {
    console.error('updateProductImage error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/products
export async function createProduct(req, res) {
  try {
    const { name, price, stock, barcode, description, imageDataUrl } = req.body || {};

    const cleanName = String(name ?? '').trim();
    const cleanBarcode = sanitizeBarcode(barcode).trimmed;
    if (!cleanName) return res.status(400).json({ error: 'name requerido' });
    if (!cleanBarcode) return res.status(400).json({ error: 'barcode requerido' });

    let cleanPrice = null;
    if (price !== undefined && price !== null && String(price).trim() !== '') {
      const n = Number(price);
      if (!isFinite(n) || n < 0) return res.status(400).json({ error: 'price inválido' });
      cleanPrice = n;
    }

    let cleanStock = 10; // valor default
    if (stock !== undefined && stock !== null && String(stock).trim() !== '') {
      const n = Number(stock);
      if (!Number.isInteger(n) || n < 0) return res.status(400).json({ error: 'stock inválido' });
      cleanStock = n;
    }

    let cleanImage = null;
    if (imageDataUrl) {
      if (!imageDataUrl.startsWith('data:') || !imageDataUrl.includes(';base64,')) {
        return res.status(400).json({ error: 'imageDataUrl debe ser data URI base64' });
      }
      if (imageDataUrl.length > 10_000_000) {
        return res.status(413).json({ error: 'imagen demasiado grande (>10MB)' });
      }
      cleanImage = imageDataUrl;
    }

    const [exist] = await pool.query(
      `SELECT id FROM products WHERE barcode = ? LIMIT 1`,
      [cleanBarcode]
    );
    if (exist.length) {
      return res.status(409).json({ error: 'Ya existe un producto con ese barcode' });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, price, stock, image, barcode, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cleanName, cleanPrice, cleanStock, cleanImage, cleanBarcode, description ?? null]
    );

    const newId = result.insertId;
    const [rows] = await pool.query(
      `SELECT id, name, price, stock, image, barcode, description
       FROM products WHERE id = ? LIMIT 1`,
      [newId]
    );
    const r = rows[0];
    return res.status(201).json({
      id: r.id,
      name: r.name,
      price: r.price,
      stock: r.stock,
      barcode: r.barcode,
      description: r.description,
      image_url: ensureDataUri(r.image),
    });
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

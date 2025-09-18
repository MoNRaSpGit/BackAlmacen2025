import { pool } from "../config/db.js";

/** Normaliza la imagen a data-URI si hace falta */
function ensureDataUri(img) {
  if (!img) return null;
  if (img.startsWith("data:")) return img;
  const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(img) && img.length > 100;
  return looksBase64 ? `data:image/webp;base64,${img}` : img;
}

// ✅ GET /api/proveedores
export async function listProveedores(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, contacto, creado_en 
       FROM proveedores 
       ORDER BY nombre ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("listProveedores error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// ✅ POST /api/productos/asignar-proveedor
export async function asignarProveedor(req, res) {
  try {
    const { proveedor_id, productos, costo } = req.body || {};
    if (!proveedor_id || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const values = productos.map((pid) => [proveedor_id, pid, costo || 0]);
    await pool.query(
      `INSERT INTO productos_proveedores (proveedor_id, producto_id, costo)
       VALUES ? 
       ON DUPLICATE KEY UPDATE costo = VALUES(costo)`,
      [values]
    );

    res.json({ success: true, proveedor_id, productos });
  } catch (err) {
    console.error("asignarProveedor error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// ✅ GET /api/proveedores/:id/productos
export async function listProductosDeProveedor(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id inválido" });
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.barcode, p.price, p.stock, 
              p.image, p.description, pp.costo
       FROM productos_proveedores pp
       JOIN products p ON p.id = pp.producto_id
       WHERE pp.proveedor_id = ?
       ORDER BY p.name ASC`,
      [id]
    );

    const items = rows.map(r => ({
      id: r.id,
      name: r.name,
      barcode: r.barcode,
      price: r.price,
      stock: r.stock,
      description: r.description,
      costo: r.costo,
      image_url: ensureDataUri(r.image),
    }));

    res.json(items);
  } catch (err) {
    console.error("listProductosDeProveedor error:", err);
    res.status(500).json({ error: "Server error" });
  }
}



// PUT /api/proveedores/:proveedorId/productos/:productoId
export async function updateProductoDeProveedor(req, res) {
  try {
    const proveedorId = Number(req.params.proveedorId);
    const productoId = Number(req.params.productoId);

    if (!Number.isInteger(proveedorId) || !Number.isInteger(productoId)) {
      return res.status(400).json({ error: "IDs inválidos" });
    }

    const { price } = req.body || {};

    // 🔹 Solo actualizamos precio
    if (price !== undefined) {
      const n = Number(price);
      if (!isFinite(n) || n < 0) {
        return res.status(400).json({ error: "price inválido" });
      }
      await pool.query(`UPDATE products SET price = ? WHERE id = ?`, [n, productoId]);
    }

    // 🔹 Devolvemos el producto actualizado
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.barcode, p.price, p.stock, 
              p.image, p.description, pp.costo
       FROM productos_proveedores pp
       JOIN products p ON p.id = pp.producto_id
       WHERE pp.proveedor_id = ? AND p.id = ?
       LIMIT 1`,
      [proveedorId, productoId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const r = rows[0];
    res.json({
      id: r.id,
      name: r.name,
      barcode: r.barcode,
      price: r.price,
      stock: r.stock,
      description: r.description,
      costo: r.costo,
      // 👇 la imagen siempre se conserva
      image_url: r.image ? r.image : null,
    });
  } catch (err) {
    console.error("updateProductoDeProveedor error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// GET /api/proveedores/otros/productos
export async function listProductosSinProveedor(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.barcode, p.price, p.stock, 
              p.image, p.description
       FROM products p
       LEFT JOIN productos_proveedores pp 
         ON p.id = pp.producto_id
       WHERE pp.proveedor_id IS NULL
       ORDER BY p.name ASC`
    );

    const items = rows.map(r => ({
      id: r.id,
      name: r.name,
      barcode: r.barcode,
      price: r.price,
      stock: r.stock,
      description: r.description,
      image_url: ensureDataUri(r.image),
    }));

    res.json(items);
  } catch (err) {
    console.error("listProductosSinProveedor error:", err);
    res.status(500).json({ error: "Server error" });
  }
}




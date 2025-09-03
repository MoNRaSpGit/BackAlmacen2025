// server/src/controllers/proveedores.js
import { pool } from "../config/db.js";

// GET /api/proveedores
export async function listProveedores(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, contacto, creado_en FROM proveedores ORDER BY nombre ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("listProveedores error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// POST /api/productos/asignar-proveedor
export async function asignarProveedor(req, res) {
  try {
    const { proveedor_id, productos, costo } = req.body || {};
    if (!proveedor_id || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const values = productos.map((pid) => [proveedor_id, pid, costo || 0]);
    await pool.query(
      `INSERT INTO productos_proveedores (proveedor_id, producto_id, costo)
       VALUES ? ON DUPLICATE KEY UPDATE costo = VALUES(costo)`,
      [values]
    );

    res.json({ success: true, proveedor_id, productos });
  } catch (err) {
    console.error("asignarProveedor error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// GET /api/proveedores/:id/productos
export async function listProductosDeProveedor(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id inválido" });
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.barcode, p.price, pp.costo
       FROM productos_proveedores pp
       JOIN products p ON p.id = pp.producto_id
       WHERE pp.proveedor_id = ?
       ORDER BY p.name ASC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error("listProductosDeProveedor error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

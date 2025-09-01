import { pool } from "../config/db.js";

// Abrir caja
export async function abrirCaja(req, res) {
  try {
    const { monto_inicial, descripcion } = req.body || {};
    if (!monto_inicial || isNaN(monto_inicial)) {
      return res.status(400).json({ error: "Monto inicial inválido" });
    }

    const [abierta] = await pool.query(
      `SELECT * FROM caja_sesiones WHERE fecha_cierre IS NULL LIMIT 1`
    );
    if (abierta.length) {
      return res.status(400).json({ error: "Ya hay una caja abierta" });
    }

    const [result] = await pool.query(
      `INSERT INTO caja_sesiones (monto_inicial, descripcion)
       VALUES (?, ?)`,
      [monto_inicial, descripcion || "Apertura de caja"]
    );

    const [rows] = await pool.query(
      `SELECT * FROM caja_sesiones WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("abrirCaja error:", err);
    res.status(500).json({ error: "Error al abrir caja" });
  }
}

// Registrar movimiento
export async function addMovimiento(req, res) {
  try {
    const { monto, tipo, descripcion } = req.body || {};
    if (!monto || isNaN(monto)) {
      return res.status(400).json({ error: "Monto inválido" });
    }
    if (!["venta", "pago", "egreso"].includes(tipo)) {
      return res.status(400).json({ error: "Tipo inválido" });
    }

    const [sesion] = await pool.query(
      `SELECT * FROM caja_sesiones WHERE fecha_cierre IS NULL LIMIT 1`
    );
    if (!sesion.length) {
      return res.status(400).json({ error: "No hay caja abierta" });
    }

    const sesion_id = sesion[0].id;

    const [result] = await pool.query(
      `INSERT INTO caja_movimientos (sesion_id, monto, tipo, descripcion)
       VALUES (?, ?, ?, ?)`,
      [sesion_id, monto, tipo, descripcion || null]
    );

    const [rows] = await pool.query(`SELECT * FROM caja_movimientos WHERE id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("addMovimiento error:", err);
    res.status(500).json({ error: "Error al registrar movimiento" });
  }
}

// Cerrar caja
export async function cerrarCaja(req, res) {
  try {
    const [sesion] = await pool.query(
      `SELECT * FROM caja_sesiones WHERE fecha_cierre IS NULL LIMIT 1`
    );
    if (!sesion.length) {
      return res.status(400).json({ error: "No hay caja abierta" });
    }
    const sesion_id = sesion[0].id;

    const [[{ ventas }]] = await pool.query(
      `SELECT IFNULL(SUM(monto),0) as ventas
       FROM caja_movimientos WHERE sesion_id = ? AND tipo='venta'`,
      [sesion_id]
    );

    const [[{ egresos }]] = await pool.query(
      `SELECT IFNULL(SUM(monto),0) as egresos
       FROM caja_movimientos WHERE sesion_id = ? AND tipo IN ('pago','egreso')`,
      [sesion_id]
    );

    const monto_final = sesion[0].monto_inicial + ventas - egresos;

    await pool.query(
      `UPDATE caja_sesiones
       SET fecha_cierre = NOW(), monto_final = ?
       WHERE id = ?`,
      [monto_final, sesion_id]
    );

    const [rows] = await pool.query(`SELECT * FROM caja_sesiones WHERE id = ?`, [sesion_id]);
    res.json({
      ...rows[0],
      resumen: { ventas, egresos, neto: monto_final }
    });
  } catch (err) {
    console.error("cerrarCaja error:", err);
    res.status(500).json({ error: "Error al cerrar caja" });
  }
}

// Listar sesiones (historial)
export async function listSesiones(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM caja_sesiones ORDER BY fecha_apertura DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("listSesiones error:", err);
    res.status(500).json({ error: "Error al listar sesiones" });
  }
}

// server/src/controllers/users.js
import { pool } from "../config/db.js";

// POST /api/users/register
export async function registerUser(req, res) {
  try {
    const { name, direccion, password } = req.body;

    if (!name || !direccion || !password) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    // verificar si ya existe
    const [exists] = await pool.query(
      "SELECT id FROM users WHERE name = ? LIMIT 1",
      [name]
    );
    if (exists.length) {
      return res.status(409).json({ error: "Usuario ya existe" });
    }

    const [result] = await pool.query(
      "INSERT INTO users (name, direccion, password) VALUES (?, ?, ?)",
      [name, direccion, password] // ojo, sin encriptar porque pediste simple
    );

    res.status(201).json({
      id: result.insertId,
      name,
      direccion,
      role: "user",
    });
  } catch (err) {
    console.error("registerUser error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// POST /api/users/login
export async function loginUser(req, res) {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    const [rows] = await pool.query(
      "SELECT id, name, direccion, role FROM users WHERE name = ? AND password = ? LIMIT 1",
      [name, password]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    res.json(rows[0]); // devolvemos el usuario (sin password)
  } catch (err) {
    console.error("loginUser error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

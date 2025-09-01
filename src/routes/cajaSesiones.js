import { Router } from "express";
import {
  abrirCaja,
  addMovimiento,
  cerrarCaja,
  listSesiones,
} from "../controllers/cajaSesiones.js";

const r = Router();

r.post("/abrir", abrirCaja);
r.post("/movimiento", addMovimiento);
r.post("/cerrar", cerrarCaja);
r.get("/historial", listSesiones);

export default r;

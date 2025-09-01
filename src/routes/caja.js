import { Router } from "express";
import {
  listMovimientos,
  addMovimiento,
  updateMovimiento,
  deleteMovimiento,
} from "../controllers/caja.js";

const r = Router();

r.get("/", listMovimientos);
r.post("/", addMovimiento);
r.put("/:id", updateMovimiento);
r.delete("/:id", deleteMovimiento);

export default r;

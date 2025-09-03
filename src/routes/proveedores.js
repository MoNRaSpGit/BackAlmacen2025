import { Router } from "express";
import {
  listProveedores,
  asignarProveedor,
  listProductosDeProveedor,
} from "../controllers/proveedores.js";

const router = Router();

// GET /api/proveedores → lista todos los proveedores
router.get("/", listProveedores);

// POST /api/proveedores/asignar → asigna productos a proveedor
router.post("/asignar", asignarProveedor);

// GET /api/proveedores/:id/productos → lista productos de un proveedor
router.get("/:id/productos", listProductosDeProveedor);

export default router;

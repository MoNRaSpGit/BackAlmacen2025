// src/routes/proveedores.js
import { Router } from "express";
import {
  listProveedores,
  asignarProveedor,
  listProductosDeProveedor,
  updateProductoDeProveedor,
  listProductosSinProveedor,
  listTodosProductos,
} from "../controllers/proveedores.js";

const router = Router();

// ✅ listar todos los proveedores
router.get("/", listProveedores);

// ✅ asignar productos a un proveedor
router.post("/productos/asignar", asignarProveedor);

// ⚡ Poner rutas específicas primero
// ✅ productos sin proveedor
router.get("/productos/sin-proveedor", listProductosSinProveedor);

// ✅ todos los productos (sin importar proveedor)
router.get("/todos/productos", listTodosProductos);

// ✅ productos de un proveedor puntual
router.get("/:id/productos", listProductosDeProveedor);

// ✅ actualizar producto de un proveedor
router.put("/:proveedorId/productos/:productoId", updateProductoDeProveedor);

export default router;

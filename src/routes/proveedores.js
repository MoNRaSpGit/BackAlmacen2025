import { Router } from "express";
import {
  listProveedores,
  asignarProveedor,
  listProductosDeProveedor,
  updateProductoDeProveedor,
  listProductosSinProveedor,
} from "../controllers/proveedores.js";

const router = Router();

// ✅ listar todos los proveedores
router.get("/", listProveedores);

// ✅ asignar productos a un proveedor
router.post("/productos/asignar", asignarProveedor);

// ✅ productos de un proveedor
router.get("/:id/productos", listProductosDeProveedor);

// ✅ actualizar producto de un proveedor
router.put("/:proveedorId/productos/:productoId", updateProductoDeProveedor);

router.get("/proveedores/otros/productos", listProductosSinProveedor);


export default router;

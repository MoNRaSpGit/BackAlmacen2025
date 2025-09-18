import { Router } from "express";
import {
  listProveedores,
  asignarProveedor,
  listProductosDeProveedor,
  updateProductoDeProveedor,
  listProductosSinProveedor ,
  listTodosProductos,
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

router.get("/productos/sin-proveedor", listProductosSinProveedor);

router.get("/todos/productos", listTodosProductos);
                                    

export default router;

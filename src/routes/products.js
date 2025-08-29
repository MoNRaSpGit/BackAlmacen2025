import { Router } from "express";
import {
  listProducts,
  getProductByBarcode,
  getProductById,
  createProduct,
  updateProduct,           // 👈 actualizar producto completo
  listUnupdatedProducts    // 👈 ahora sí lo importamos
  // updateProductImage,    // 👈 si ya no lo usás, lo sacás
} from "../controllers/products.js";

const r = Router();

// Listado general
r.get("/", listProducts);

// Productos sin actualizar (sin barcode e imagen)
r.get("/unupdated", listUnupdatedProducts);

r.get("/by-barcode/:code", getProductByBarcode);
r.get("/:id", getProductById);
r.post("/", createProduct);

// Editar producto (nombre, precio, imagen, etc.)
r.put("/:id", updateProduct);

// Si querés mantener el endpoint solo para imagen:
// r.put("/:id/image", updateProductImage);

export default r;

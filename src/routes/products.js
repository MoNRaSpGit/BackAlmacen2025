import { Router } from "express";
import {
  listProducts,
  getProductByBarcode,
  getProductById,
  createProduct,
  updateProduct, // 👈 nuevo
  // updateProductImage, // 👈 si ya no lo usás, lo sacamos
} from "../controllers/products.js";

const r = Router();

r.get("/", listProducts);
r.get("/by-barcode/:code", getProductByBarcode);
r.get("/:id", getProductById);
r.post("/", createProduct);
r.get('/unupdated', listUnupdatedProducts);


// Ruta general para editar nombre, precio, imagen
r.put("/:id", updateProduct);

// Si todavía querés mantener el endpoint viejo SOLO de imagen, lo dejás:
/// r.put("/:id/image", updateProductImage);

export default r;

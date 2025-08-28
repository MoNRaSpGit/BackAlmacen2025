import express from "express";
import {
  listProducts,
  getProductByBarcode,
  getProductById,
  updateProductImage,
  createProduct,
  updateProduct,   // 👈 agregar este
} from "../controllers/products.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/by-barcode/:code", getProductByBarcode);
router.get("/:id", getProductById);
router.put("/:id/image", updateProductImage);
router.post("/", createProduct);
router.put("/:id", updateProduct);  // 👈 acá

export default router;

import { Router } from "express";
import {
  listProducts,
  getProductByBarcode,
  getProductById,
} from "../controllers/productosActualizados.js";


const r = Router();

r.get("/", listProducts);
r.get("/by-barcode/:code", getProductByBarcode);
r.get("/:id", getProductById);

export default r;

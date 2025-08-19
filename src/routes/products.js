import { Router } from 'express';
import {
  listProducts,
  getProductByBarcode,
  getProductById,
  updateProductImage,
  createProduct,          // ⬅️ nuevo
} from '../controllers/products.js';

const r = Router();

r.get('/', listProducts);
r.get('/by-barcode/:code', getProductByBarcode);
r.get('/:id', getProductById);
r.put('/:id/image', updateProductImage);
r.post('/', createProduct);                // ⬅️ NUEVO

export default r;

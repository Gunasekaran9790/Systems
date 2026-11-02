import { Router } from 'express';

import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  updateProductStatus,
  deleteProduct,
} from '../controllers/productController';

import {
  productSchema,
  productIdSchema,
  productStatusSchema,
} from '../validators/productValidator';

import {
  validate,
  validateParams,
} from '../middleware/validateMiddleware';

const router = Router();

// Get all products
router.get(
  '/',
  getAllProducts,
);

// Get product by ID
router.get(
  '/:id',
  validateParams(productIdSchema),
  getProductById,
);

// Create product
router.post(
  '/',
  validate(productSchema),
  createProduct,
);

// Update product
router.put(
  '/:id',
  validateParams(productIdSchema),
  validate(productSchema),
  updateProduct,
);

// Update product status
router.patch(
  '/:id/status',
  validateParams(productIdSchema),
  validate(productStatusSchema),
  updateProductStatus,
);

// Delete product
router.delete(
  '/:id',
  validateParams(productIdSchema),
  deleteProduct,
);

export default router;
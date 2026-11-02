import type { Request, Response } from 'express';

import * as ProductModel from '../models/productModel';

// Get All Products
export async function getAllProducts(
  req: Request,
  res: Response,
) {
  try {
    const products = await ProductModel.getAllProducts();

    return res.status(200).json({ products });
  } catch (error) {
    console.error('Get products error:', error);

    return res.status(500).json({
      message: 'Failed to load products.',
    });
  }
}

// Create Product
export async function createProduct(
  req: Request,
  res: Response,
) {
  try {
    const {
      sku,
      name,
      description,
      unit,
      purchase_price,
      selling_price,
      tax_rate,
      stock_quantity,
      minimum_stock,
      status,
    } = req.body;

    await ProductModel.createProduct({
      sku,
      name,
      description,
      unit,
      purchase_price,
      selling_price,
      tax_rate,
      stock_quantity,
      minimum_stock,
      status,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
    });
  } catch (error) {
    console.error('Create product error:', error);

    const err = error as Error;

    if (
      err.message?.includes('SKU already exists')
    ) {
      return res.status(409).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create product.',
    });
  }
}

// Get Product By ID
export async function getProductById(
  req: Request,
  res: Response,
) {
  try {
    const product = await ProductModel.getProductById(
      req.params.id,
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.',
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('Get product error:', error);

    return res.status(500).json({
      message: 'Failed to load product.',
    });
  }
}

// Update Product
export async function updateProduct(
  req: Request,
  res: Response,
) {
  try {
    const existing = await ProductModel.getProductById(
      req.params.id,
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const {
      sku,
      name,
      description,
      unit,
      purchase_price,
      selling_price,
      tax_rate,
      stock_quantity,
      minimum_stock,
      status,
    } = req.body;

    await ProductModel.updateProduct(req.params.id, {
      sku,
      name,
      description,
      unit,
      purchase_price,
      selling_price,
      tax_rate,
      stock_quantity,
      minimum_stock,
      status,
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
    });
  } catch (error) {
    console.error('Update product error:', error);

    const err = error as Error;

    if (
      err.message?.includes('SKU already exists')
    ) {
      return res.status(409).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update product.',
    });
  }
}

// Update Product Status
export async function updateProductStatus(
  req: Request,
  res: Response,
) {
  try {
    const { status } = req.body;

    const existing = await ProductModel.getProductById(
      req.params.id,
    );

    if (!existing) {
      return res.status(404).json({
        message: 'Product not found.',
      });
    }

    await ProductModel.updateProductStatus(
      req.params.id,
      status,
    );

    return res.status(200).json({
      message: 'Product status updated successfully.',
    });
  } catch (error) {
    console.error('Update product status error:', error);

    return res.status(500).json({
      message: 'Failed to update product status.',
    });
  }
}

// Delete Product
export async function deleteProduct(
  req: Request,
  res: Response,
) {
  try {
    const existing = await ProductModel.getProductById(
      req.params.id,
    );

    if (!existing) {
      return res.status(404).json({
        message: 'Product not found.',
      });
    }

    await ProductModel.deleteProduct(req.params.id);

    return res.status(200).json({
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    console.error('Delete product error:', error);

    const err = error as { code?: string };

    // Product is referenced by another table
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message:
          'This product is already used in transactions and cannot be deleted. Please mark it as inactive instead.',
      });
    }

    return res.status(500).json({
      message: 'Failed to delete product.',
    });
  }
}
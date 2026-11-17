import { Request, Response } from 'express';
import { QuotationModel } from '../models/quotationModel';

export class QuotationController {
  static async getAll(_req: Request, res: Response) {
    try {
      const quotations = await QuotationModel.getAll();
      return res.json({ success: true, data: quotations });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Unable to load quotations',
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const quotation = await QuotationModel.getById(Number(req.params.id));

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found',
        });
      }

      return res.json({ success: true, data: quotation });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Unable to load quotation',
      });
    }
  }

  static async searchCustomers(req: Request, res: Response) {
    try {
      const search = String(req.query.search ?? '');
      const customers = await QuotationModel.searchCustomers(search);
      return res.json({ success: true, data: customers });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Unable to search customers',
      });
    }
  }

  static async searchProducts(req: Request, res: Response) {
    try {
      const search = String(req.query.search ?? '');
      const products = await QuotationModel.searchProducts(search);
      return res.json({ success: true, data: products });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Unable to search products',
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Please login to continue',
        });
      }

      const quotation = await QuotationModel.create(req.body, userId);

      return res.status(201).json({
        success: true,
        message: 'Quotation created successfully',
        data: quotation,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error
          ? error.message
          : 'Unable to create quotation',
      });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      await QuotationModel.updateStatus(
        Number(req.params.id),
        req.body.status,
      );

      return res.json({
        success: true,
        message: 'Quotation status updated successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error
          ? error.message
          : 'Unable to update quotation status',
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await QuotationModel.delete(Number(req.params.id));

      return res.json({
        success: true,
        message: 'Quotation deleted successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error
          ? error.message
          : 'Unable to delete quotation',
      });
    }
  }
}
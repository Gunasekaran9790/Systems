
import type { Request, Response } from 'express';
import { QuotationModel } from '../models/quotationModel';
import { QuotationPDFService } from '../utils/quotationPdfService';

export class QuotationController {

  static async getAll(_req: Request, res: Response) {
    try {
      const quotations = await QuotationModel.getAll();

      return res.json({
        success: true,
        data: quotations,
      });
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
      const quotation = await QuotationModel.getById(
        Number(req.params.id),
      );

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found',
        });
      }

      return res.json({
        success: true,
        data: quotation,
      });
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

      return res.json({
        success: true,
        data: customers,
      });
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

      return res.json({
        success: true,
        data: products,
      });
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

      const quotation = await QuotationModel.create(
        req.body,
        userId,
      );

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

  // Update quotation (draft only, enforced by the model)
  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quotation ID',
        });
      }

      const quotation = await QuotationModel.update(
        id,
        req.body,
      );

      return res.json({
        success: true,
        message: 'Quotation updated successfully',
        data: quotation,
      });
    } catch (error) {
      console.error(error);

      const message = error instanceof Error
        ? error.message
        : 'Unable to update quotation';

      const statusCode = message === 'Quotation not found'
        ? 404
        : 400;

      return res.status(statusCode).json({
        success: false,
        message,
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
      console.error(error);

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
      console.error(error);

      return res.status(400).json({
        success: false,
        message: error instanceof Error
          ? error.message
          : 'Unable to delete quotation',
      });
    }
  }

  // Generate quotation PDF

  
  // Generate quotation PDF
  static async generatePDF(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quotation ID',
        });
      }

      const quotation = await QuotationModel.getById(id);

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found',
        });
      }

      const pdfBuffer = await QuotationPDFService.generate(quotation);

    //   const quotationNo = String(
    //     (quotation as unknown as { quotation_no?: string }).quotation_no ?? id
    //   );

    const quotationNo = quotation.quotation_no || String(id);

      const download = req.query.download === 'true';

      res.setHeader('Content-Type', 'application/pdf');

    //   res.setHeader(
    //     'Content-Disposition',
    //     `inline; filename="quotation-${quotationNo}.pdf"`,
    //   );

    res.setHeader(
    'Content-Disposition',
    `${download ? 'attachment' : 'inline'}; filename="quotation-${quotationNo}.pdf"`,
    );

      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);

    } catch (error) {
      console.error('Generate quotation PDF error:', error);

      return res.status(500).json({
        success: false,
        message: error instanceof Error
          ? error.message
          : 'Unable to generate quotation PDF',
      });
    }
  }


//   static async generatePDF(req: Request, res: Response) {
//     try {
//       const id = Number(req.params.id);

//       if (!Number.isInteger(id) || id <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid quotation ID',
//         });
//       }

//       const quotation = await QuotationModel.getById(id);

//       if (!quotation) {
//         return res.status(404).json({
//           success: false,
//           message: 'Quotation not found',
//         });
//       }

//       const pdfBuffer = await QuotationPDFService.generate(quotation);

//       const quotationNo = String((quotation as any).quotation_no ?? id,);

//       res.setHeader( 'Content-Disposition', `inline; filename="quotation-${quotationNo}.pdf"`,);

//     //   res.setHeader('Content-Type', 'application/pdf');
//     //   res.setHeader(
//     //     // 'Content-Disposition',
//     //     // `attachment; filename="quotation-${quotation.quotation_no}.pdf"`,
//     //     'Content-Disposition',
//     //     `inline; filename="quotation-${quotation.quotation_no}.pdf"`,
//     //   );
//       res.setHeader('Content-Length', pdfBuffer.length);

//       return res.send(pdfBuffer);
//     } catch (error) {
//       console.error('Generate quotation PDF error:', error);

//       return res.status(500).json({
//         success: false,
//         message: error instanceof Error
//           ? error.message
//           : 'Unable to generate quotation PDF',
//       });
//     }
//   }
}

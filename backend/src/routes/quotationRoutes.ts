import { Router } from 'express';
import { QuotationController } from '../controllers/quotationController';
import { requireAuth } from '../middleware/requireAuth';
import { validate, validateParams } from '../middleware/validateMiddleware';
import {
  createQuotationSchema,
  quotationIdParamsSchema,
  updateQuotationStatusSchema,
} from '../validators/quotationValidator';

const router = Router();

router.use(requireAuth);

router.get('/', QuotationController.getAll);
router.get('/customers/search', QuotationController.searchCustomers);
router.get('/products/search', QuotationController.searchProducts);

router.post(
  '/',
  validate(createQuotationSchema),
  QuotationController.create,
);

router.get(
  '/:id',
  validateParams(quotationIdParamsSchema),
  QuotationController.getById,
);

router.patch(
  '/:id/status',
  validateParams(quotationIdParamsSchema),
  validate(updateQuotationStatusSchema),
  QuotationController.updateStatus,
);

router.delete(
  '/:id',
  validateParams(quotationIdParamsSchema),
  QuotationController.delete,
);

router.put(
  '/:id',
  validateParams(quotationIdParamsSchema),
  validate(createQuotationSchema),
  QuotationController.update,
);

router.get(
  '/:id/pdf',
  validateParams(quotationIdParamsSchema),
  QuotationController.generatePDF,
);


export default router;
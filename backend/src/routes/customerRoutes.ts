import { Router } from 'express';

import {
  getAllCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  updateCustomerStatus,
  deleteCustomer,
} from '../controllers/customerController';

import {
  customerSchema,
  customerIdSchema,
} from '../validators/customerValidator';

import {
  validate,
  validateParams,
} from '../middleware/validateMiddleware';

const router = Router();

router.get('/', getAllCustomers);

router.get(
  '/:id',
  validateParams(customerIdSchema),
  getCustomerById
);

router.post(
  '/',
  validate(customerSchema),
  createCustomer
);

router.put(
  '/:id',
  validateParams(customerIdSchema),
  validate(customerSchema),
  updateCustomer
);

router.patch(
  '/:id/status',
  validateParams(customerIdSchema),
  updateCustomerStatus
);

router.delete(
  '/:id',
  validateParams(customerIdSchema),
  deleteCustomer
);

export default router;
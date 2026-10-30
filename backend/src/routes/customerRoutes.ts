
import { Router } from 'express';
import { getAllCustomers, createCustomer, getCustomerById, updateCustomer, updateCustomerStatus, deleteCustomer,} from '../controllers/customerController';

const router = Router();

router.get('/', getAllCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.patch('/:id/status', updateCustomerStatus);
router.delete('/:id', deleteCustomer);

export default router;

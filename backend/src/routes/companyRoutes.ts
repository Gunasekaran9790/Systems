import { Router } from 'express';
import {
  getCompany,
  saveCompany,
} from '../controllers/companyController';
import { companyUpload } from '../middleware/companyUpload';
import { validateCompany } from '../validators/companyValidator';

const router = Router();

router.get('/', getCompany);

router.put(
  '/',
  companyUpload.single('logo'),
  validateCompany,
  saveCompany,
);

export default router;
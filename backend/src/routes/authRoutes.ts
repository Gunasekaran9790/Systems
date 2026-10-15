import { Router } from 'express'
import { signup } from '../controllers/authController'
import { validate } from '../middleware/validateMiddleware'
import { signupSchema } from '../validators/authValidation'

const router = Router()

router.post('/signup', validate(signupSchema), signup)

export default router


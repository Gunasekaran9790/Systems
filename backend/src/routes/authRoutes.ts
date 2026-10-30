import { Router } from 'express'
import { signup } from '../controllers/authController'
import { login } from '../controllers/loginController'
import { logout } from '../controllers/logoutController'
import { validate } from '../middleware/validateMiddleware'
import { signupSchema } from '../validators/authValidation'
import { loginSchema } from '../validators/loginValidation'
import { rateLimit } from 'express-rate-limit'
import { getCurrentUser } from '../controllers/sessionController'


const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts. Please try again later.',
  },
})

router.post('/signup', validate(signupSchema), signup)

router.post('/login',loginLimiter, validate(loginSchema), login,)

//router.get('/me', getCurrentUser)

router.get("/me", (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  return res.status(200).json({
    authenticated: true,
    user: { id: req.session.userId },
  });
});

router.post('/logout', logout);

// router.post("/logout", (req, res, next) => {
//   if (!req.session) {
//     return res.sendStatus(204);
//   }

//   req.session.destroy((err) => {
//     if (err) {
//       return next(err);
//     }

//     res.clearCookie("connect.sid", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//     });

//     return res.sendStatus(204);
//   });
// });  



export default router


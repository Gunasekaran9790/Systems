// middleware/requireAuth.ts
import { RequestHandler } from 'express';

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session?.userId) {
    res.status(401).json({
      success: false,
      message: 'Please login to continue',
    });
    return;
  }

  next();
};
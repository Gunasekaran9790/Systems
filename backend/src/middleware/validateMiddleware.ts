import type { Request, Response, NextFunction, RequestHandler, } from 'express'

import type { ZodType } from 'zod'

export function validate(schema: ZodType): RequestHandler {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    const result = schema.safeParse(req.body)

    // if (!result.success) {
    //   res.status(400).json({
    //     success: false,
    //     message: 'Validation failed',
    //     errors: result.error.issues.map((issue) => ({
    //       field: issue.path.join('.'),
    //       message: issue.message,
    //     })),
    //   })
    //   return
    // }

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        message: errors[0]?.message || 'Validation failed',
        errors,
      });

      return;
    }

    // Replace body with validated data, including transformations.
    req.body = result.data

    next()
  }
}

export function validateParams(schema: ZodType): RequestHandler {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        message: errors[0]?.message || 'Invalid request parameters',
        errors,
      });

      return;
    }

    next();
  };
}
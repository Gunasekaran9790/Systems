import express from 'express';
import apiRoutes from './routes';
import session from 'express-session'
import cors from 'cors';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import path from 'path';
import companyRoutes from './routes/companyRoutes';
import multer from 'multer';
import quotationRoutes from './routes/quotationRoutes';

const app = express();

// Disable browser and proxy caching
// app.use((req, res, next) => {
//   res.setHeader(
//     'Cache-Control',
//     'no-store, no-cache, must-revalidate, proxy-revalidate'
//   );
//   res.setHeader('Pragma', 'no-cache');
//   res.setHeader('Expires', '0');
//   next();
// });


// 1. Configure CORS FIRST
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 4. session generate
app.use(
  session({
    name: 'app.sid',
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  }),
)

// 2. Parse JSON request bodies
//app.use(express.json({ limit: '10kb' }));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 3. Register API routes
app.use('/api/v1/auth', apiRoutes);

// Customer Routes
app.use('/api/v1/customers', customerRoutes);

// Product Routes
app.use('/api/v1/products', productRoutes);

// Company info
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
app.use('/api/v1/company', companyRoutes);

//Quotation
app.use('/api/v1/quotations', quotationRoutes);

// Handle Multer and other errors.
app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error(error);

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Logo size must not exceed 2 MB.',
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Something went wrong.',
    });
  },
);

// Health check
// app.get('/api/health', (_req, res) => {
//   res.json({
//     success: true,
//     message: 'Backend is running!',
//   });
// });

export default app;
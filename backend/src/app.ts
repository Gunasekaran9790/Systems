import express from 'express';
import apiRoutes from './routes';
import session from 'express-session'
import cors from 'cors';

const app = express();

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
app.use(express.json({ limit: '10kb' }));

// 3. Register API routes
app.use('/api/v1/auth', apiRoutes);

// Health check
// app.get('/api/health', (_req, res) => {
//   res.json({
//     success: true,
//     message: 'Backend is running!',
//   });
// });

export default app;
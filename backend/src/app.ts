import express from 'express';
import apiRoutes from './routes';
import cors from 'cors';

const app = express();

// 1. Configure CORS FIRST
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
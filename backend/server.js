// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import evaluationRoutes from './src/routes/evaluationRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000', // URL Next.js frontend Anda
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 files
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

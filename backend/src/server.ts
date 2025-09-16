import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import resinRoutes from './routes/resins';
import consumptionRoutes from './routes/consumption';
import inventoryRoutes from './routes/inventory';
import materialRoutes from './routes/materials';

// Load environment variables
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "potrosnja-smole-jwt-secret-key-2024-production-secure-token-key";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for production
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://stock.eightcode.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resins', resinRoutes);
app.use('/api/consumption', consumptionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/materials', materialRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ 
      message: 'CORS policy violation',
      origin: req.headers.origin,
      allowedOrigins: corsOptions.origin
    });
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://niksys97_mngdb_user:ViMBLXmhnOd9Sc34@potrosnjasmole.jmojzq5.mongodb.net/?retryWrites=true&w=majority&appName=potrosnjaSmole';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`JWT Secret configured: ${JWT_SECRET ? 'Yes' : 'No'}`);
});

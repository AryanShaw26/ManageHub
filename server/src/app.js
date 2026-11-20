import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import institutionRoutes from './modules/institutions/institution.routes.js';
import userRoutes from './modules/users/user.routes.js';
import programRoutes from './modules/programs/program.routes.js';
import classRoutes from './modules/classes/class.routes.js';
import studentRoutes from './modules/students/student.routes.js';
import academicRoutes from './modules/academics/academic.routes.js';
import { csrfProtection } from './middleware/csrf.js';

const app = express();

if (config.isProduction) {
  // Render/Railway-style deployments terminate TLS at a reverse proxy.
  app.set('trust proxy', 1);
}

// Global API rate limiter — baseline protection for all routes
// Auth-specific stricter limits are applied separately in auth.routes.js
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' } },
  skip: (req) => req.path === '/health', // health check is exempt
});
app.use('/api/', globalApiLimiter);

const allowedOrigins = config.clientOrigin
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''));

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        (!config.isProduction && (
          cleanOrigin.startsWith('http://localhost:') ||
          cleanOrigin === 'http://localhost' ||
          cleanOrigin.startsWith('http://127.0.0.1:')
        ))
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-ManageHub-Client'],
  })
);

// Request parsing — size limits prevent request body DoS attacks
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(csrfProtection);

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  const payload = {
    status: 'ok',
    product: 'ManageHub',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };
  // Uptime is useful in development/staging but reveals runtime info in production
  if (!config.isProduction) {
    payload.uptime = process.uptime();
  }
  res.status(200).json(payload);
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/institution', institutionRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/programs', programRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/students', studentRoutes);
// Direct academic routes & direct PRD-mapped academic routes
app.use('/api/v1/academics', academicRoutes);
app.use('/api/v1', academicRoutes);

// Serve Client Static Files if built
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Catch 404 & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

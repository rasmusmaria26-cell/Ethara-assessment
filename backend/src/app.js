import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import tasksRouter from './routes/tasks.js';
import dashboardRouter from './routes/dashboard.js';
import { verifyJWT } from './middleware/auth.js';

const app = express();

// Security headers
app.use(helmet());

// CORS — allow the frontend origin (set FRONTEND_URL env in production)
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin (no origin header) or allowed localhost
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      
      // Allow any Vercel deployment domain
      if (origin.match(/https?:\/\/.*\.vercel\.app$/)) return callback(null, true);

      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routing Strategy: Support both local (/api) and Vercel (stripped) prefixes
const apiRouter = express.Router();

// Public routes
apiRouter.use('/auth', authRouter);

// Protected routes — verifyJWT runs first
apiRouter.use('/projects', verifyJWT, projectsRouter);
apiRouter.use('/projects', verifyJWT, dashboardRouter);
apiRouter.use('/', verifyJWT, tasksRouter);

// Mount the apiRouter at both /api (local) and root (Vercel stripped prefix)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('--- SERVER ERROR ---');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;

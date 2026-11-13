import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import prisma from './db/prisma.js';
import routes from './routes/index.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000', /\.vercel\.app$/],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  })
);

// Global parsing & tracking
app.use(requestIdMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (env.NODE_ENV !== 'test') {
  app.use(morgan(':date[iso] :method :url :status :response-time ms - reqId=:req[x-request-id]'));
}

// Rate limiting for general endpoints
app.use('/api/', generalLimiter);

// Health check handler
const healthCheckHandler = async (req, res) => {
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
  } catch (error) {
    dbStatus = 'unhealthy';
  }

  const isHealthy = dbStatus === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    app: env.APP_NAME,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      paypal: {
        environment: env.PAYPAL_ENV,
        configured: env.PAYPAL_CLIENT_ID !== 'replace_with_sandbox_client_id',
      },
      ai: {
        provider: env.AI_PROVIDER,
        configured: env.AI_API_KEY !== 'replace_me',
      },
    },
  });
};

app.get('/health', healthCheckHandler);
app.get('/api/health', healthCheckHandler);
app.get('/api/v1/health', healthCheckHandler);

// Mount API routes (supports both /api/v1 and /api)
app.use('/api/v1', routes);
app.use('/api', routes);

// 404 & Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

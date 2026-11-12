import app from './app.js';
import { env } from './config/env.js';
import prisma from './db/prisma.js';
import { logger } from './utils/logger.js';

let server;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database');

    server = app.listen(env.PORT, () => {
      logger.info(`${env.APP_NAME} backend listening on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`Health check: http://localhost:${env.PORT}/health`);
      logger.info(`API base URL: http://localhost:${env.PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message });
    process.exit(1);
  }
}

async function shutdown() {
  logger.info('Shutting down server gracefully...');
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Prisma disconnected, server closed');
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();

export { app, server };


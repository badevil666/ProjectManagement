import { createApp } from './app';
import { env } from './config/env';
import { disconnectPrisma } from './repositories/base';
import { logger } from './utils/logger';

const app = createApp();

if (env.corsOrigins.length === 0) {
  logger.warn(
    'CORS_ORIGIN is not set — cross-origin browser requests will be rejected. ' +
      'Set CORS_ORIGIN to your frontend URL(s) (comma-separated) to allow them.',
  );
}

const server = app.listen(env.port, () => {
  logger.info(`Client Portal backend listening on port ${env.port} [${env.nodeEnv}]`);
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });

  // Force-exit if graceful shutdown hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', reason);
});

import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Single shared PrismaClient instance for the whole process.
 *
 * This is the ONLY place in the codebase that should import/instantiate
 * `PrismaClient`. Every other module (services, controllers, etc.) must
 * depend on repository interfaces instead of touching Prisma directly.
 */
declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  });
}

// Avoid exhausting DB connections when tsx/ts-node-dev hot-reloads the
// module in development.
export const prisma: PrismaClient = global.__prisma ?? createPrismaClient();

if (env.nodeEnv === 'development') {
  global.__prisma = prisma;
}

export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    logger.error('Error while disconnecting Prisma client', error);
  }
}

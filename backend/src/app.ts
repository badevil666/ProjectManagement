import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';
import { ForbiddenError, NotFoundError } from './utils/AppError';

export function createApp(): Application {
  const app = express();

  // Both deployment topologies (docker-compose nginx, and Render's edge in
  // production) place exactly one reverse-proxy hop in front of this app.
  // Trusting that single hop lets Express (and express-rate-limit, which
  // keys off req.ip) resolve the real client IP from X-Forwarded-For
  // instead of collapsing every client onto the proxy's own address.
  app.set('trust proxy', 1);

  app.disable('x-powered-by');
  app.use(helmet());

  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser requests (no Origin header, e.g. curl/health checks).
        if (!origin || env.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new ForbiddenError(`Origin "${origin}" is not allowed by CORS`));
      },
      credentials: true,
    }),
  );

  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', routes);

  // Never serve /uploads as a static directory — downloads always stream
  // through the authenticated/share-scoped API routes.
  app.use((req, _res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
  });

  app.use(errorHandler);

  return app;
}

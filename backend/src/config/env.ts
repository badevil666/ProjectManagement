import 'dotenv/config';
import { z } from 'zod';

/**
 * Schema for the environment variables read by the running server process.
 *
 * NOTE: ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME are intentionally NOT part
 * of this schema — they are consumed only by `prisma/seed.ts`, which
 * validates them independently (see `validateSeedEnv` there). The main
 * server never needs them.
 *
 * NOTE: SMTP_* variables are validated for *shape* (correct types) when
 * present, but are not required for the server to boot — per the spec,
 * outbound email must be a no-op-safe, log-and-skip feature when SMTP
 * credentials are absent (e.g. local dev without Gmail SMTP configured).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_FROM: z.string().min(1).optional(),
});

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

export interface AppEnv {
  nodeEnv: 'development' | 'production' | 'test';
  isProduction: boolean;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
  uploadDir: string;
  smtp: SmtpConfig | null;
}

function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // Fail fast with a clear, readable error — this must never leave the
    // process running with a partially-valid configuration.
    const fieldErrors = parsed.error.flatten().fieldErrors;
    console.error('Invalid environment configuration. Missing/invalid variables:');
    console.error(JSON.stringify(fieldErrors, null, 2));
    process.exit(1);
  }

  const data = parsed.data;

  const smtpFields = [
    data.SMTP_HOST,
    data.SMTP_PORT,
    data.SMTP_USER,
    data.SMTP_PASS,
    data.SMTP_FROM,
  ];
  const smtpConfigured = smtpFields.every((field) => field !== undefined && field !== null);

  if (!smtpConfigured && smtpFields.some((field) => field !== undefined)) {
    console.warn(
      'Partial SMTP configuration detected (some SMTP_* vars set, others missing). ' +
        'Treating email sending as disabled until all of SMTP_HOST/PORT/USER/PASS/FROM are set.',
    );
  }

  const smtp: SmtpConfig | null = smtpConfigured
    ? {
        host: data.SMTP_HOST as string,
        port: data.SMTP_PORT as number,
        user: data.SMTP_USER as string,
        pass: data.SMTP_PASS as string,
        from: data.SMTP_FROM as string,
      }
    : null;

  return {
    nodeEnv: data.NODE_ENV,
    isProduction: data.NODE_ENV === 'production',
    port: data.PORT,
    databaseUrl: data.DATABASE_URL,
    jwtSecret: data.JWT_SECRET,
    jwtExpiresIn: data.JWT_EXPIRES_IN,
    corsOrigins: data.CORS_ORIGIN.split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
    uploadDir: data.UPLOAD_DIR,
    smtp,
  };
}

export const env: AppEnv = loadEnv();

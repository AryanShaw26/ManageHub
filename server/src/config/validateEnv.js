import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be at least 64 characters long'),
  CLIENT_ORIGIN: z.string().min(1, 'CLIENT_ORIGIN is required'),
  COOKIE_NAME: z.string().default('managehub_token'),
});

const INSECURE_DEV_SECRETS = [
  'managehub_development_secret_key_2026',
  'replace-with-long-random-secret',
  'replace_with_a_secure_random_64_character_hex_string_in_production_env',
  'secret',
  'changeme',
  '12345678901234567890123456789012',
];

export const validateEnvironment = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`).join('\n');
    console.error('FATAL: Environment validation failed:\n' + errorDetails);
    throw new Error(`Environment validation failed. Please review your environment variables:\n${errorDetails}`);
  }

  const env = result.data;

  // Extra check for production
  if (env.NODE_ENV === 'production') {
    const normalizedSecret = env.JWT_SECRET.toLowerCase();
    if (
      INSECURE_DEV_SECRETS.includes(normalizedSecret) ||
      normalizedSecret.includes('replace') ||
      normalizedSecret.includes('example') ||
      normalizedSecret.includes('development')
    ) {
      throw new Error(
        'FATAL: JWT_SECRET in production is using an insecure development placeholder. Provide a unique, high-entropy secret.'
      );
    }
    if (!env.DATABASE_URL.startsWith('postgresql://') && !env.DATABASE_URL.startsWith('postgres://')) {
      throw new Error('FATAL: DATABASE_URL must be a valid PostgreSQL connection string in production.');
    }
    const origins = env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim());
    if (origins.some((origin) => {
      try {
        const url = new URL(origin);
        return url.protocol !== 'https:' || url.pathname !== '/';
      } catch {
        return true;
      }
    })) {
      throw new Error('FATAL: CLIENT_ORIGIN must contain only exact HTTPS origins in production.');
    }
  }

  return env;
};

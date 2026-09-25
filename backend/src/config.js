import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  MONGO_URI: z.string().min(1),
  FRONTEND_ORIGINS: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  PYTHON_SERVICE_URL: z.string().url(),
  PYTHON_ANALYZE_PATH: z.string().startsWith('/').default('/v1/analyze-resume'),
  PYTHON_TIMEOUT_MS: z.coerce.number().int().positive().default(90000),
  PYTHON_RETRIES: z.coerce.number().int().min(0).max(3).default(1),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  UPLOAD_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  DB_CONNECT_RETRIES: z.coerce.number().int().min(0).max(10).default(5),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(120000),
  TRUST_PROXY: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  LOG_LEVEL: z.string().default('info'),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.issues.map(issue => issue.path.join('.')).join(', ')}`)
}

export const config = {
  ...parsed.data,
  frontendOrigins: parsed.data.FRONTEND_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean),
  isProduction: parsed.data.NODE_ENV === 'production',
}
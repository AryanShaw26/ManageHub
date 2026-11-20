import dotenv from 'dotenv';
dotenv.config();

import { validateEnvironment } from './validateEnv.js';

const validatedEnv = validateEnvironment();

const config = {
  port: validatedEnv.PORT,
  nodeEnv: validatedEnv.NODE_ENV,
  clientOrigin: validatedEnv.CLIENT_ORIGIN,
  jwtSecret: validatedEnv.JWT_SECRET,
  jwtExpiresIn: '24h',
  cookieName: validatedEnv.COOKIE_NAME,
  isProduction: validatedEnv.NODE_ENV === 'production',
};

export default config;

import { errorResponse } from '../utils/response.js';
import config from '../config/index.js';

/**
 * CSRF Protection Middleware
 *
 * Protects state-changing requests (POST, PATCH, PUT, DELETE) that rely on cookie-based authentication.
 * Requests utilizing the Authorization header (Bearer token) are inherently protected against CSRF.
 * Cookie-authenticated requests are verified against trusted Origins/Referers.
 */
export const csrfProtection = (req, res, next) => {
  // Safe read-only methods are exempt
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // If request has Authorization Bearer header, browser cross-origin forms cannot forge it
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  const publicAuthPaths = ['/api/v1/auth/login', '/api/v1/auth/register-institution'];
  const hasCookie = req.cookies && req.cookies[config.cookieName];

  // Public auth mutations must also validate their origin to prevent login/registration CSRF.
  if (hasCookie || publicAuthPaths.includes(req.path)) {
    let origin = req.headers.origin || null;
    if (!origin && req.headers.referer) {
      try {
        origin = new URL(req.headers.referer).origin;
      } catch {
        origin = null;
      }
    }

    if (origin) {
      const allowedOrigins = config.clientOrigin
        .split(',')
        .map((o) => o.trim().replace(/\/$/, ''));

      const cleanOrigin = origin.replace(/\/$/, '');

      const isDevelopmentLoopback =
        !config.isProduction &&
        (
          cleanOrigin.startsWith('http://localhost:') ||
          cleanOrigin === 'http://localhost' ||
          cleanOrigin.startsWith('http://127.0.0.1:')
        );

      if (!allowedOrigins.includes(cleanOrigin) && !isDevelopmentLoopback) {
        return errorResponse(
          res,
          403,
          'CSRF_BLOCKED',
          'Cross-Site Request Forgery validation failed: Origin is not authorized'
        );
      }
    } else if (config.isProduction) {
      // In production, reject state-changing cookie requests without Origin/Referer
      return errorResponse(
        res,
        403,
        'CSRF_BLOCKED',
        'State-changing cookie requests must include a valid Origin or custom header'
      );
    }
  }

  next();
};

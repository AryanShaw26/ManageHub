import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const signToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn,
    issuer: 'managehub',
    audience: 'managehub-api',
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'managehub',
      audience: 'managehub-api',
    });
  } catch (error) {
    return null;
  }
};

export const generateInstitutionCode = (name) => {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName || 'MH'}-${randomSuffix}`;
};

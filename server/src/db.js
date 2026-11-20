import { PrismaClient } from '@prisma/client';

// 'query' level logging is gated behind DEBUG_SQL=true to avoid leaking SQL
// (and potentially sensitive parameter values) into standard log aggregators.
const logLevels =
  process.env.DEBUG_SQL === 'true'
    ? ['query', 'error', 'warn']
    : process.env.NODE_ENV === 'production'
    ? ['error']
    : ['error', 'warn'];

const prisma = new PrismaClient({ log: logLevels });

export default prisma;

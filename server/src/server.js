import app from './app.js';
import config from './config/index.js';
import prisma from './db.js';

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('Connected to PostgreSQL database');

    const server = app.listen(config.port, () => {
      console.log(`ManageHub API server running on port ${config.port} [${config.nodeEnv}]`);
    });

    const shutdown = async () => {
      console.log('Shutting down ManageHub API server...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Database disconnected. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

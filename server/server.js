require('dotenv').config();

const app = require('./src/app');
const prisma = require('./src/utils/prisma'); // shared singleton — no second connection pool

const PORT = parseInt(process.env.PORT, 10) || 5000;

// ── Startup ────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Verify DB connection before accepting traffic
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    const server = app.listen(PORT, () => {
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  🎓 CampusFlow API Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Port        : ${PORT}`);
      console.log(`  API Base    : http://localhost:${PORT}/api/v1`);
      console.log(`  Health      : http://localhost:${PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });

    // ── Graceful shutdown ────────────────────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Database disconnected. Goodbye!');
        process.exit(0);
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled Promise Rejection:', reason);
      if (process.env.NODE_ENV === 'production') shutdown('UNHANDLED_REJECTION');
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();

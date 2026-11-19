'use strict';
const { connectDatabase, closeDatabase, databaseName } = require('./database');
(async () => {
  try {
    if (require('fs').existsSync('.env')) process.loadEnvFile('.env');
    const db = await connectDatabase();
    await db.command({ ping: 1 });
    console.log(`MongoDB connected successfully: ${databaseName()}`);
  } catch (error) {
    console.error('MongoDB connection failed:', String(error.message).replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, '[REDACTED]'));
    process.exitCode = 1;
  } finally { await closeDatabase(); }
})();

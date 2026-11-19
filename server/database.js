'use strict';
const { MongoClient } = require('mongodb');
let client;
let db;
let connecting;

function databaseName() {
  return process.env.MONGODB_DB || 'OravelLifestyle';
}

async function connectDatabase() {
  if (db) return db;
  if (!connecting) connecting = (async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri) || uri.includes('<db_password>') || uri.includes('YOUR_PASSWORD')) {
      throw new Error('Set a valid MONGODB_URI in your server environment');
    }
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 10 });
    try {
      await client.connect();
      const database = client.db(databaseName());
      await database.command({ ping: 1 });
      const users = database.collection('users');
      await users.createIndex({ id: 1 }, { unique: true });
      await users.createIndex({ email: 1 }, { unique: true });
      await users.createIndex({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $gt: '' } } });
      const orders = database.collection('orders');
      await orders.createIndex({ id: 1 }, { unique: true });
      await orders.createIndex({ trackingId: 1 }, { unique: true, partialFilterExpression: { trackingId: { $gt: '' } } });
      await orders.createIndex({ userId: 1 });
      await database.collection('products').createIndex({ id: 1 }, { unique: true });
      await database.collection('newsletter').createIndex({ email: 1 }, { unique: true });
      const codes = database.collection('verification_codes');
      await codes.createIndex({ id: 1 }, { unique: true });
      await codes.createIndex({ purpose: 1, destination: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });
      for (const name of ['contact_messages', 'auth_events', 'site_events']) {
        await database.collection(name).createIndex({ id: 1 }, { unique: true });
      }
      for (const name of ['orders', 'users', 'contact_messages', 'auth_events', 'site_events', 'verification_codes', 'newsletter']) {
        await database.collection(name).createIndex({ createdAt: -1 });
      }
      db = database;
      return db;
    } catch (error) {
      await client.close().catch(() => {});
      client = undefined;
      throw error;
    }
  })().catch(error => { connecting = undefined; throw error; });
  return connecting;
}

function collection(name) {
  if (!db) throw new Error('MongoDB is not connected');
  return db.collection(name);
}

async function closeDatabase() {
  if (client) await client.close();
  client = undefined;
  db = undefined;
  connecting = undefined;
}

module.exports = { connectDatabase, collection, databaseName, closeDatabase };

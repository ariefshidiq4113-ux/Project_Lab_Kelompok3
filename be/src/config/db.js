require('dotenv').config();
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI belum diisi di file .env');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`[db] terhubung ke "${mongoose.connection.name}"`);
  return mongoose.connection;
}

module.exports = { connectDB };

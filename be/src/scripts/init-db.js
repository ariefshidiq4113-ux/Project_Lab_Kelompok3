// Membuat semua collection + index di MongoDB. Aman dijalankan berulang kali.
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const models = require('../models');

(async () => {
  await connectDB();
  for (const [name, Model] of Object.entries(models)) {
    await Model.createCollection().catch(() => {}); // abaikan jika sudah ada
    await Model.syncIndexes();
    console.log(`[init] ${name} -> collection "${Model.collection.name}" siap`);
  }
  console.log('[init] selesai');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });

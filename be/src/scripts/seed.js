// Mengisi collection `members` dari data/members.json (hasil konversi KTA_Pengurus_HIMAFOR_2627.xlsx).
// Aman dijalankan berulang: data diperbarui berdasarkan NIM, password yang sudah diganti tidak ditimpa.
//   npm run db:seed                 -> isi database
//   npm run db:seed -- --dry-run    -> hanya validasi data, tanpa koneksi database
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { Member } = require('../models');
const { ADMIN_JABATAN } = require('../config/jabatan');
const data = require('../../data/members.json');

const DRY = process.argv.includes('--dry-run');

function toDoc(row) {
  const doc = { ...row };
  doc.tanggalLahir = row.tanggalLahir ? new Date(`${row.tanggalLahir}T00:00:00Z`) : undefined;
  Object.keys(doc).forEach((k) => (doc[k] == null || doc[k] === '') && delete doc[k]);
  return doc;
}

(async () => {
  // 1) Validasi semua baris terhadap schema sebelum menulis apa pun
  const errors = [];
  for (const row of data) {
    const err = new Member({ ...toDoc(row), passwordHash: 'x' }).validateSync();
    if (err) errors.push(`${row.nama} (${row.nim}): ${Object.values(err.errors).map((e) => e.message).join('; ')}`);
  }
  if (errors.length) {
    console.error('[seed] data tidak valid:\n - ' + errors.join('\n - '));
    process.exit(1);
  }
  console.log(`[seed] ${data.length} anggota lolos validasi`);

  const admins = data.filter((r) => ADMIN_JABATAN.includes(r.jabatan));
  console.log(`[seed] akses admin (${admins.length}): ` + admins.map((a) => `${a.nama} - ${a.jabatan}`).join(' | '));
  if (DRY) return console.log('[seed] dry-run selesai, database tidak diubah');

  // 2) Tulis ke MongoDB. Password awal = NIM (di-hash), wajib diganti saat login pertama.
  await connectDB();
  const ops = [];
  for (const row of data) {
    const { nim, ...fields } = toDoc(row);
    ops.push({
      updateOne: {
        filter: { nim },
        update: {
          $set: fields,
          $setOnInsert: { passwordHash: await bcrypt.hash(nim, 10), mustChangePassword: true, aktif: true },
        },
        upsert: true,
      },
    });
  }
  const res = await Member.bulkWrite(ops);
  console.log(`[seed] baru: ${res.upsertedCount}, diperbarui: ${res.modifiedCount}, total di database: ${await Member.countDocuments()}`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });

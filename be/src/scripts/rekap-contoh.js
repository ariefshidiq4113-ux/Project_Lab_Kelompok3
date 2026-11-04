// Contoh query Rekap: jumlah kehadiran per status untuk kegiatan terbaru (dipakai halaman Rekap_Admin).
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { Activity, AttendanceSession, AttendanceRecord } = require('../models');

(async () => {
  await connectDB();
  const kegiatan = await Activity.findOne().sort({ tanggal: -1 });
  if (!kegiatan) { console.log('Belum ada kegiatan. Jalankan npm run db:contoh'); return mongoose.disconnect(); }

  const sesiIds = (await AttendanceSession.find({ activityId: kegiatan._id })).map((s) => s._id);
  const rekap = await AttendanceRecord.aggregate([
    { $match: { sessionId: { $in: sesiIds } } },
    { $group: { _id: '$status', jumlah: { $sum: 1 } } },
  ]);
  console.log(`Rekap "${kegiatan.judul}":`, rekap);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });

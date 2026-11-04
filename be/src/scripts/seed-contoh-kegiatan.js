// OPSIONAL: membuat 1 kegiatan + 1 sesi presensi contoh untuk menguji aplikasi.
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { Member, Activity, AttendanceSession } = require('../models');

(async () => {
  await connectDB();
  const sekum = await Member.findOne({ jabatan: 'Sekretaris Umum I' });
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  let kegiatan = await Activity.findOne({ judul: 'Rapat Kerja HIMAFOR (contoh)' });
  if (!kegiatan) {
    kegiatan = await Activity.create({
      judul: 'Rapat Kerja HIMAFOR (contoh)', tanggal: today, jamMulai: '09:00', jamSelesai: '12:00',
      lokasi: 'Ruang Sidang Fakultas', agenda: 'Pembahasan program kerja', createdBy: sekum?._id,
    });
    await AttendanceSession.create({ activityId: kegiatan._id, label: 'Presensi Masuk' });
  }
  console.log('[contoh] kegiatan dan sesi contoh siap');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });

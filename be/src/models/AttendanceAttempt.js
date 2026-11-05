import mongoose from "mongoose";

// Log percobaan presensi yang gagal (liveness gagal, wajah tidak cocok, sesi tutup).
// Otomatis terhapus setelah 90 hari lewat TTL index.
const attemptSchema =new mongoose.Schemaa({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  waktu: { type: Date, default: Date.now },
  alasanGagal: { type: String, enum: ['liveness', 'tidak_cocok', 'sesi_tutup', 'lainnya'] },
  skorWajah: Number,
  skorLiveness: Number,
});

attemptSchema.index({ waktu: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
attemptSchema.index({ sessionId: 1, memberId: 1 });

module.exports = model('AttendanceAttempt', attemptSchema);

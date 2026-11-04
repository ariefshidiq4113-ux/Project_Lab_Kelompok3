const { Schema, model } = require('mongoose');

const recordSchema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    waktu: { type: Date, default: Date.now },
    status: { type: String, enum: ['hadir', 'terlambat', 'izin', 'alpha'], required: true },
    skorWajah: Number,
    skorLiveness: Number,
    metode: { type: String, enum: ['wajah', 'manual'], default: 'wajah' },
  },
  { timestamps: true }
);

recordSchema.index({ sessionId: 1, memberId: 1 }, { unique: true }); // cegah presensi ganda
recordSchema.index({ memberId: 1, waktu: -1 }); // halaman Riwayat

module.exports = model('AttendanceRecord', recordSchema);

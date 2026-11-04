const { Schema, model } = require('mongoose');

const sessionSchema = new Schema(
  {
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    label: { type: String, default: 'Presensi' }, // mis. "Presensi Masuk" / "Presensi Keluar"
    status: { type: String, enum: ['belum_dibuka', 'dibuka', 'ditutup'], default: 'belum_dibuka' },
    dibukaPada: Date,
    ditutupPada: Date,
    dibukaOleh: { type: Schema.Types.ObjectId, ref: 'Member' },
  },
  { timestamps: true }
);

sessionSchema.index({ activityId: 1 });
sessionSchema.index({ status: 1 }); // halaman Sesi Presensi: sesi yang sedang dibuka

module.exports = model('AttendanceSession', sessionSchema);

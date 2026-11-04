const { Schema, model } = require('mongoose');

const activitySchema = new Schema(
  {
    judul: { type: String, required: true, trim: true, maxlength: 150 },
    tanggal: { type: Date, required: true },
    jamMulai: { type: String, required: true, match: /^\d{2}:\d{2}$/ }, // "08:00"
    jamSelesai: { type: String, match: /^\d{2}:\d{2}$/ },
    lokasi: { type: String, trim: true, maxlength: 150 },
    agenda: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  },
  { timestamps: true }
);

activitySchema.index({ tanggal: 1 }); // tab Hari ini / Mendatang / Selesai

module.exports = model('Activity', activitySchema);

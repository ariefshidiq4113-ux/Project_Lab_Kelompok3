const { Schema, model } = require('mongoose');

const auditSchema = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: 'Member' },
  aksi: { type: String, required: true }, // mis. "koreksi_presensi", "nonaktifkan_anggota"
  target: String,
  detail: Schema.Types.Mixed,
  waktu: { type: Date, default: Date.now },
});

auditSchema.index({ waktu: -1 });

module.exports = model('AuditLog', auditSchema);

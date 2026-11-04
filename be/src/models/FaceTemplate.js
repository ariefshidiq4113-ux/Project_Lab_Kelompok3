const { Schema, model } = require('mongoose');

const faceTemplateSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    embedding: { type: Buffer, required: true, select: false }, // terenkripsi, lihat utils/crypto.js
    modelVersion: { type: String, required: true }, // mis. "mobilefacenet-tflite-v1"
    aktif: { type: Boolean, default: true },
    consentAt: { type: Date, required: true }, // waktu anggota menyetujui pengambilan data wajah
  },
  { timestamps: true }
);

// Hanya boleh ada 1 template aktif per anggota
faceTemplateSchema.index(
  { memberId: 1 },
  { unique: true, partialFilterExpression: { aktif: true } }
);

module.exports = model('FaceTemplate', faceTemplateSchema);

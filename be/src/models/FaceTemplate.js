import mongoose from "mongoose";

const faceTemplateSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
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

const FaceTemplate = mongoose.model("FaceTemplate", faceTemplateSchema, "facetemplates");

export default FaceTemplate;

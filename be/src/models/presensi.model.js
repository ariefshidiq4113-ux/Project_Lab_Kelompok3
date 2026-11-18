import mongoose from "mongoose";

const presensiSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    // Simpan sebagai string — tidak bergantung model Kegiatan
    kegiatanId: { type: String, required: true },
    kegiatanNama: { type: String, required: true },
    waktuPresensi: { type: Date, required: true, default: Date.now },
    metode: {
      type: String,
      enum: ["wajah", "wajah+liveness"],
      default: "wajah+liveness",
    },
    status: {
      type: String,
      enum: ["hadir", "ditolak"],
      default: "hadir",
    },
  },
  { timestamps: true }
);

// Satu member hanya boleh presensi satu kali per kegiatan
presensiSchema.index({ member: 1, kegiatanId: 1 }, { unique: true });

const Presensi = mongoose.model("Presensi", presensiSchema, "presensi");

export default Presensi;

import mongoose from "mongoose";

const kegiatanSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true },
    tanggal: { type: Date, required: true },
    waktuMulai: { type: String, required: true }, // format "HH:mm"
    waktuSelesai: { type: String, required: true },
    lokasi: { type: String, trim: true },
    deskripsi: { type: String, trim: true },
    // Status sesi presensi
    sesiDibuka: { type: Boolean, default: false },
    sesiDibukaPada: { type: Date },
    sesiDitutupPada: { type: Date },
    // Siapa yang membuat kegiatan
    dibuatOleh: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Kegiatan = mongoose.model("Kegiatan", kegiatanSchema, "kegiatan");

export default Kegiatan;

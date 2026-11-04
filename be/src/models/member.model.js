import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true },
    nim: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    passwordHash: { type: String, required: true },
    jenisKelamin: { type: String, enum: ["Laki-laki", "Perempuan"] },
    tempatLahir: { type: String, trim: true },
    tanggalLahir: { type: Date },
    noTelepon: { type: String, trim: true },
    jabatan: { type: String, trim: true },
    departemen: { type: String, trim: true },
    kodeDepartemen: { type: String, trim: true },
    mustChangePassword: { type: Boolean, default: true },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Jabatan yang punya akses admin
const ADMIN_JABATAN = [
  "Ketua Umum",
  "Wakil Ketua Umum",
  "Sekretaris Umum I",
  "Sekretaris Umum II",
];

memberSchema.virtual("isAdmin").get(function () {
  return ADMIN_JABATAN.includes(this.jabatan);
});

memberSchema.set("toJSON", { virtuals: true });

const Member = mongoose.model("Member", memberSchema, "members");

export default Member;

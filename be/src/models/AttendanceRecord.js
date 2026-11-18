import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSession", required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    waktu: { type: Date, default: Date.now },
    status: { type: String, enum: ["hadir", "terlambat", "izin", "alpha"], required: true },
    skorWajah: Number,
    skorLiveness: Number,
    metode: { type: String, enum: ["wajah", "manual"], default: "wajah" },
  },
  { timestamps: true }
);

recordSchema.index({ sessionId: 1, memberId: 1 }, { unique: true }); // cegah presensi ganda
recordSchema.index({ memberId: 1, waktu: -1 }); // halaman Riwayat

const AttendanceRecord = mongoose.model("AttendanceRecord", recordSchema, "attendancerecords");

export default AttendanceRecord;

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    label: { type: String, default: "Presensi" },
    status: { type: String, enum: ["belum_dibuka", "dibuka", "ditutup"], default: "belum_dibuka" },
    dibukaPada: Date,
    ditutupPada: Date,
    dibukaOleh: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  },
  { timestamps: true }
);

sessionSchema.index({ activityId: 1 });
sessionSchema.index({ status: 1 }); // halaman Sesi Presensi: sesi yang sedang dibuka

const AttendanceSession = mongoose.model("AttendanceSession", sessionSchema, "attendancesessions");

export default AttendanceSession;

import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    judul: { type: String, required: true, trim: true, maxlength: 150 },
    tanggal: { type: Date, required: true },
    jamMulai: { type: String, required: true, match: /^\d{2}:\d{2}$/ }, // "08:00"
    jamSelesai: { type: String, match: /^\d{2}:\d{2}$/ },
    lokasi: { type: String, trim: true, maxlength: 150 },
    agenda: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

activitySchema.index({ tanggal: 1 }); // tab Hari ini / Mendatang / Selesai

const Activity = mongoose.model("Activity", activitySchema, "activities");

export default Activity;

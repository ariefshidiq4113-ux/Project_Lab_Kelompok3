import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import AttendanceSession from "../models/AttendanceSession.js";

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function parseTimes(jam) {
  if (typeof jam !== "string") return null;
  const times = jam.split(/[–-]/).map((value) => value.trim());
  if (times.length !== 2 || times.some((value) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))) {
    return null;
  }
  return { jamMulai: times[0], jamSelesai: times[1] };
}

function parseDate(tanggal) {
  if (typeof tanggal !== "string" || !tanggal.trim()) return null;
  const date = new Date(tanggal);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toEventResponse(activity, sessions = []) {
  const status = sessions.some((session) => session.status === "dibuka")
    ? "dibuka"
    : sessions.some((session) => session.status === "ditutup")
      ? "selesai"
      : "belum";

  return {
    id: activity._id.toString(),
    nama: activity.judul,
    tanggal: activity.tanggal.toISOString(),
    jam: [activity.jamMulai, activity.jamSelesai].filter(Boolean).join("–"),
    lokasi: activity.lokasi || "",
    agenda: activity.agenda || "",
    status,
  };
}

async function getSessionsByActivityIds(activityIds) {
  if (!activityIds.length) return new Map();
  const sessions = await AttendanceSession.find({ activityId: { $in: activityIds } })
    .sort({ createdAt: 1 });
  const byActivityId = new Map();
  for (const session of sessions) {
    const key = session.activityId.toString();
    const values = byActivityId.get(key) || [];
    values.push(session);
    byActivityId.set(key, values);
  }
  return byActivityId;
}

function reportError(res, error, operation) {
  console.error(`[activities:${operation}]`, error);
  return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
}

export const activityController = {
  async getAllEvents(req, res) {
    try {
      const activities = await Activity.find({ aktif: { $ne: false } }).sort({ tanggal: 1, createdAt: -1 });
      const sessionsByActivity = await getSessionsByActivityIds(activities.map((activity) => activity._id));
      let data = activities.map((activity) =>
        toEventResponse(activity, sessionsByActivity.get(activity._id.toString()) || []),
      );
      if (["dibuka", "belum", "selesai"].includes(req.query.status)) {
        data = data.filter((activity) => activity.status === req.query.status);
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return reportError(res, error, "list");
    }
  },

  async getEventById(req, res) {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "ID kegiatan tidak valid." });
      }
      const activity = await Activity.findOne({ _id: req.params.id, aktif: { $ne: false } });
      if (!activity) {
        return res.status(404).json({ success: false, message: "Kegiatan tidak ditemukan." });
      }
      const sessions = await AttendanceSession.find({ activityId: activity._id }).sort({ createdAt: 1 });
      return res.status(200).json({ success: true, data: toEventResponse(activity, sessions) });
    } catch (error) {
      return reportError(res, error, "detail");
    }
  },

  async createEvent(req, res) {
    try {
      const { nama, tanggal, jam, lokasi } = req.body;
      const date = parseDate(tanggal);
      const times = parseTimes(jam);
      if (typeof nama !== "string" || !nama.trim() || !date || !times) {
        return res.status(400).json({
          success: false,
          message: "Nama kegiatan, tanggal, serta jam mulai dan selesai wajib diisi dengan format yang valid.",
        });
      }

      const activity = await Activity.create({
        judul: nama.trim(),
        tanggal: date,
        ...times,
        lokasi: typeof lokasi === "string" ? lokasi.trim() : "",
      });
      return res.status(201).json({ success: true, data: toEventResponse(activity) });
    } catch (error) {
      return reportError(res, error, "create");
    }
  },

  async updateEvent(req, res) {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "ID kegiatan tidak valid." });
      }
      const { nama, tanggal, jam, lokasi } = req.body;
      const date = parseDate(tanggal);
      const times = parseTimes(jam);
      if (typeof nama !== "string" || !nama.trim() || !date || !times) {
        return res.status(400).json({
          success: false,
          message: "Nama kegiatan, tanggal, serta jam mulai dan selesai wajib diisi dengan format yang valid.",
        });
      }

      const activity = await Activity.findOneAndUpdate(
        { _id: req.params.id, aktif: { $ne: false } },
        {
          judul: nama.trim(),
          tanggal: date,
          ...times,
          lokasi: typeof lokasi === "string" ? lokasi.trim() : "",
        },
        { new: true, runValidators: true },
      );
      if (!activity) {
        return res.status(404).json({ success: false, message: "Kegiatan tidak ditemukan." });
      }
      const sessions = await AttendanceSession.find({ activityId: activity._id });
      return res.status(200).json({ success: true, data: toEventResponse(activity, sessions) });
    } catch (error) {
      return reportError(res, error, "update");
    }
  },

  async deleteEvent(req, res) {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "ID kegiatan tidak valid." });
      }
      const activity = await Activity.findOneAndUpdate(
        { _id: req.params.id, aktif: { $ne: false } },
        { aktif: false },
        { new: true },
      );
      if (!activity) {
        return res.status(404).json({ success: false, message: "Kegiatan tidak ditemukan." });
      }
      await AttendanceSession.updateMany(
        { activityId: activity._id, status: "dibuka" },
        { status: "ditutup", ditutupPada: new Date() },
      );
      return res.status(200).json({ success: true, message: "Kegiatan berhasil diarsipkan." });
    } catch (error) {
      return reportError(res, error, "delete");
    }
  },

  async updateEventStatus(req, res) {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: "ID kegiatan tidak valid." });
      }
      const { status } = req.body;
      if (status !== "dibuka" && status !== "selesai") {
        return res.status(400).json({ success: false, message: "Status sesi tidak valid." });
      }

      const activity = await Activity.findOne({ _id: req.params.id, aktif: { $ne: false } });
      if (!activity) {
        return res.status(404).json({ success: false, message: "Kegiatan tidak ditemukan." });
      }

      if (status === "dibuka") {
        const activeSession = await AttendanceSession.findOne({ status: "dibuka" }).populate("activityId", "judul");
        if (
          activeSession &&
          activeSession.activityId &&
          activeSession.activityId._id.toString() !== activity._id.toString()
        ) {
          return res.status(409).json({
            success: false,
            message: `Sesi "${activeSession.activityId.judul}" masih dibuka. Tutup terlebih dahulu.`,
          });
        }
        if (!activeSession) {
          await AttendanceSession.create({
            activityId: activity._id,
            status: "dibuka",
            dibukaPada: new Date(),
          });
        }
      } else {
        const result = await AttendanceSession.updateMany(
          { activityId: activity._id, status: "dibuka" },
          { status: "ditutup", ditutupPada: new Date() },
        );
        if (result.matchedCount === 0) {
          return res.status(409).json({ success: false, message: "Tidak ada sesi presensi yang sedang dibuka." });
        }
      }

      const sessions = await AttendanceSession.find({ activityId: activity._id });
      return res.status(200).json({ success: true, data: toEventResponse(activity, sessions) });
    } catch (error) {
      return reportError(res, error, "status");
    }
  },
};

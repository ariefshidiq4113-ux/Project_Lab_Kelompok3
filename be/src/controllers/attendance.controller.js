import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import AttendanceRecord from "../models/AttendanceRecord.js";
import AttendanceSession from "../models/AttendanceSession.js";
import Member from "../models/member.model.js";

const VALID_STATUSES = ["hadir", "terlambat", "izin"];

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function toRecordResponse(record) {
  const member = record.memberId;
  return {
    id: record._id.toString(),
    memberId: member?._id?.toString() || member?.toString(),
    nama: member?.nama || "Anggota tidak ditemukan",
    email: member?.email || "",
    waktu: new Date(record.waktu).toISOString(),
    status: record.status,
  };
}

function reportError(res, error, operation) {
  console.error(`[attendance:${operation}]`, error);
  return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
}

export const attendanceController = {
  async toggleSession(req, res) {
    try {
      const { eventId } = req.params;
      if (!isValidId(eventId)) {
        return res.status(400).json({ success: false, message: "ID kegiatan tidak valid." });
      }

      const activity = await Activity.findOne({ _id: eventId, aktif: { $ne: false } });
      if (!activity) {
        return res.status(404).json({ success: false, message: "Kegiatan tidak ditemukan." });
      }

      const { status } = req.body;
      if (status === "dibuka") {
        const activeSession = await AttendanceSession.findOne({ status: "dibuka" }).populate("activityId", "judul");
        if (activeSession && activeSession.activityId?._id.toString() !== eventId) {
          return res.status(409).json({
            success: false,
            message: `Sesi "${activeSession.activityId?.judul || "lain"}" masih dibuka. Tutup terlebih dahulu.`,
          });
        }

        const session = activeSession || await AttendanceSession.create({
          activityId: activity._id,
          status: "dibuka",
          dibukaPada: new Date(),
        });
        return res.status(200).json({
          success: true,
          session: { id: session._id.toString(), status: session.status },
        });
      }

      if (status === "selesai") {
        const result = await AttendanceSession.updateMany(
          { activityId: activity._id, status: "dibuka" },
          { status: "ditutup", ditutupPada: new Date() },
        );
        if (result.matchedCount === 0) {
          return res.status(409).json({ success: false, message: "Tidak ada sesi yang sedang dibuka." });
        }
        return res.status(200).json({
          success: true,
          session: { status: "ditutup" },
        });
      }

      return res.status(400).json({ success: false, message: "Status sesi tidak valid." });
    } catch (error) {
      return reportError(res, error, "toggle-session");
    }
  },

  async submitAttendance(req, res) {
    try {
      const { eventId, memberId, status = "hadir" } = req.body;
      if (!isValidId(eventId) || !isValidId(memberId) || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "Kegiatan, anggota, atau status tidak valid." });
      }

      const session = await AttendanceSession.findOne({ activityId: eventId, status: "dibuka" });
      if (!session) {
        return res.status(409).json({ success: false, message: "Sesi presensi belum dibuka." });
      }
      const member = await Member.findOne({ _id: memberId, aktif: { $ne: false } });
      if (!member) {
        return res.status(404).json({ success: false, message: "Anggota tidak ditemukan." });
      }

      const record = await AttendanceRecord.create({
        sessionId: session._id,
        memberId: member._id,
        waktu: new Date(),
        status,
        metode: "wajah",
      });
      await record.populate("memberId", "nama email");
      return res.status(201).json({ success: true, data: toRecordResponse(record) });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        return res.status(409).json({ success: false, message: "Anggota sudah tercatat hadir pada sesi ini." });
      }
      return reportError(res, error, "submit");
    }
  },

  async createManualAttendance(req, res) {
    try {
      const { eventId, memberId, status = "hadir" } = req.body;
      if (!isValidId(eventId) || !isValidId(memberId) || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "Kegiatan, anggota, atau status tidak valid." });
      }

      const session = await AttendanceSession.findOne({ activityId: eventId, status: "dibuka" });
      if (!session) {
        return res.status(409).json({ success: false, message: "Buka sesi presensi sebelum mencatat kehadiran." });
      }
      const member = await Member.findOne({ _id: memberId, aktif: { $ne: false } });
      if (!member) {
        return res.status(404).json({ success: false, message: "Anggota tidak ditemukan." });
      }

      const record = await AttendanceRecord.create({
        sessionId: session._id,
        memberId: member._id,
        waktu: new Date(),
        status,
        metode: "manual",
      });
      await record.populate("memberId", "nama email");
      return res.status(201).json({ success: true, data: toRecordResponse(record) });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        return res.status(409).json({ success: false, message: "Anggota sudah tercatat hadir pada sesi ini." });
      }
      return reportError(res, error, "manual");
    }
  },

  async getAttendanceByEvent(req, res) {
    try {
      const { eventId } = req.params;
      if (!isValidId(eventId)) {
        return res.status(400).json({ success: false, message: "ID kegiatan tidak valid." });
      }
      const activity = await Activity.findOne({ _id: eventId, aktif: { $ne: false } });
      if (!activity) {
        return res.status(404).json({ success: false, message: "Kegiatan tidak ditemukan." });
      }

      const session = await AttendanceSession.findOne({ activityId: eventId }).sort({ createdAt: -1 });
      if (!session) {
        return res.status(200).json({ success: true, session: null, data: [] });
      }

      const records = await AttendanceRecord.find({ sessionId: session._id })
        .populate("memberId", "nama email")
        .sort({ waktu: -1 });
      return res.status(200).json({
        success: true,
        session: { id: session._id.toString(), status: session.status },
        data: records.map(toRecordResponse),
      });
    } catch (error) {
      return reportError(res, error, "list");
    }
  },

  async updateAttendance(req, res) {
    try {
      const { eventId, recordId } = req.params;
      if (!isValidId(eventId) || !isValidId(recordId)) {
        return res.status(400).json({ success: false, message: "ID kegiatan atau catatan tidak valid." });
      }
      const { status } = req.body;
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "Status kehadiran tidak valid." });
      }

      const session = await AttendanceSession.findOne({ activityId: eventId }).sort({ createdAt: -1 });
      if (!session) {
        return res.status(404).json({ success: false, message: "Sesi presensi tidak ditemukan." });
      }
      const record = await AttendanceRecord.findOneAndUpdate(
        { _id: recordId, sessionId: session._id },
        { status },
        { new: true, runValidators: true },
      ).populate("memberId", "nama email");
      if (!record) {
        return res.status(404).json({ success: false, message: "Catatan kehadiran tidak ditemukan." });
      }
      return res.status(200).json({ success: true, data: toRecordResponse(record) });
    } catch (error) {
      return reportError(res, error, "update");
    }
  },

  async deleteAttendance(req, res) {
    try {
      const { eventId, recordId } = req.params;
      if (!isValidId(eventId) || !isValidId(recordId)) {
        return res.status(400).json({ success: false, message: "ID kegiatan atau catatan tidak valid." });
      }
      const session = await AttendanceSession.findOne({ activityId: eventId }).sort({ createdAt: -1 });
      if (!session) {
        return res.status(404).json({ success: false, message: "Sesi presensi tidak ditemukan." });
      }
      const record = await AttendanceRecord.findOneAndDelete({ _id: recordId, sessionId: session._id });
      if (!record) {
        return res.status(404).json({ success: false, message: "Catatan kehadiran tidak ditemukan." });
      }
      return res.status(200).json({ success: true, message: "Catatan kehadiran berhasil dihapus." });
    } catch (error) {
      return reportError(res, error, "delete");
    }
  },

  async getRecapData(req, res) {
    try {
      const { eventId, periode } = req.query;
      const activityFilter = { aktif: { $ne: false } };
      if (eventId && eventId !== "all") {
        if (!isValidId(eventId)) {
          return res.status(400).json({ success: false, message: "ID kegiatan tidak valid." });
        }
        activityFilter._id = eventId;
      } else if (periode && periode !== "all") {
        if (typeof periode !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(periode)) {
          return res.status(400).json({ success: false, message: "Format periode harus YYYY-MM." });
        }
        const [year, month] = periode.split("-").map(Number);
        activityFilter.tanggal = {
          $gte: new Date(Date.UTC(year, month - 1, 1)),
          $lt: new Date(Date.UTC(year, month, 1)),
        };
      }
      const activities = await Activity.find(activityFilter).select("_id");
      const activityIds = activities.map((activity) => activity._id);
      const sessions = await AttendanceSession.find({ activityId: { $in: activityIds } }).select("_id activityId");
      const activityBySessionId = new Map(
        sessions.map((session) => [session._id.toString(), session.activityId.toString()]),
      );
      const sessionIds = sessions.map((session) => session._id);
      const members = await Member.find({ aktif: { $ne: false } }).select("nama");
      const records = await AttendanceRecord.find({ sessionId: { $in: sessionIds } });

      const memberRecaps = members.map((member) => {
        const attendedActivities = new Set(
          records
            .filter((record) =>
              record.memberId.toString() === member._id.toString() &&
              (record.status === "hadir" || record.status === "terlambat"),
            )
            .map((record) => activityBySessionId.get(record.sessionId.toString()))
            .filter(Boolean),
        );
        const attended = attendedActivities.size;
        const total = activities.length;
        return {
          member: { id: member._id.toString(), nama: member.nama },
          hadir: attended,
          tidakHadir: Math.max(total - attended, 0),
          persen: total === 0 ? 0 : Math.round((attended / total) * 100),
        };
      });
      const hadir = memberRecaps.reduce((sum, item) => sum + item.hadir, 0);
      const tidakHadir = memberRecaps.reduce((sum, item) => sum + item.tidakHadir, 0);
      const total = hadir + tidakHadir;

      return res.status(200).json({
        success: true,
        summary: {
          totalEvents: activities.length,
          hadir,
          tidakHadir,
          persen: total === 0 ? 0 : Math.round((hadir / total) * 100),
        },
        memberRecaps,
      });
    } catch (error) {
      return reportError(res, error, "recap");
    }
  },

  async getMyAttendanceHistory(req, res) {
    try {
      const records = await AttendanceRecord.find({ memberId: req.memberId })
        .populate({
          path: "sessionId",
          select: "activityId",
          populate: { path: "activityId", select: "judul tanggal" },
        })
        .sort({ waktu: -1 });

      const statusLabels = {
        hadir: "Hadir",
        terlambat: "Terlambat",
        izin: "Izin",
        alpha: "Tidak hadir",
      };

      return res.status(200).json({
        success: true,
        data: records.map((record) => {
          const activity = record.sessionId?.activityId;
          return {
            id: record._id.toString(),
            eventId: activity
              ? { nama: activity.judul, tanggal: activity.tanggal.toISOString() }
              : undefined,
            waktu: record.waktu.toISOString(),
            status: statusLabels[record.status] ?? "Tidak hadir",
          };
        }),
      });
    } catch (error) {
      return reportError(res, error, "my-history");
    }
  },
};

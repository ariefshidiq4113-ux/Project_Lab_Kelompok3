import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import FaceTemplate from "../models/FaceTemplate.js";
import Member from "../models/member.model.js";

function toMemberResponse(member, faceRegistered = false) {
  return {
    id: member._id.toString(),
    nim: member.nim,
    nama: member.nama,
    email: member.email || "",
    role: member.role || (member.jabatan && member.jabatan !== "Anggota Departemen" ? "Pengurus" : "Anggota"),
    wajah: faceRegistered ? "terdaftar" : "belum",
  };
}

function validId(id) {
  return mongoose.isValidObjectId(id);
}

function reportError(res, error, operation) {
  console.error(`[members:${operation}]`, error);
  return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
}

export const memberController = {
  async getAllMembers(req, res) {
    try {
      const { search } = req.query;
      const query = { aktif: { $ne: false } };
      if (typeof search === "string" && search.trim()) {
        const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.$or = [
          { nama: { $regex: escapedSearch, $options: "i" } },
          { email: { $regex: escapedSearch, $options: "i" } },
          { nim: { $regex: escapedSearch, $options: "i" } },
        ];
      }

      const members = await Member.find(query).select("-passwordHash").sort({ createdAt: -1 });
      const activeFaces = members.length
        ? await FaceTemplate.find({
            memberId: { $in: members.map((member) => member._id) },
            aktif: true,
          }).select("memberId")
        : [];
      const faceMemberIds = new Set(activeFaces.map((face) => face.memberId.toString()));

      return res.status(200).json({
        success: true,
        data: members.map((member) => toMemberResponse(member, faceMemberIds.has(member._id.toString()))),
      });
    } catch (error) {
      return reportError(res, error, "list");
    }
  },

  async getMemberById(req, res) {
    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "ID anggota tidak valid." });
      }
      const member = await Member.findOne({ _id: req.params.id, aktif: { $ne: false } }).select("-passwordHash");
      if (!member) {
        return res.status(404).json({ success: false, message: "Anggota tidak ditemukan." });
      }
      const faceRegistered = await FaceTemplate.exists({ memberId: member._id, aktif: true });
      return res.status(200).json({ success: true, data: toMemberResponse(member, Boolean(faceRegistered)) });
    } catch (error) {
      return reportError(res, error, "detail");
    }
  },

  async createMember(req, res) {
    try {
      const { nama, email, nim, role } = req.body;
      if (
        typeof nama !== "string" || !nama.trim() ||
        typeof email !== "string" || !email.trim() ||
        typeof nim !== "string" || !nim.trim() ||
        (role !== "Pengurus" && role !== "Anggota")
      ) {
        return res.status(400).json({ success: false, message: "NIM, nama, email, dan peran wajib diisi." });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedNim = nim.trim();
      const existingMember = await Member.findOne({
        $or: [{ email: normalizedEmail }, { nim: normalizedNim }],
      });
      if (existingMember) {
        const duplicateField = existingMember.nim === normalizedNim ? "NIM" : "Email";
        return res.status(409).json({ success: false, message: `${duplicateField} sudah terdaftar.` });
      }

      const member = await Member.create({
        nama: nama.trim(),
        email: normalizedEmail,
        nim: normalizedNim,
        passwordHash: await bcrypt.hash(normalizedNim, 10),
        mustChangePassword: true,
        role,
        aktif: true,
      });
      return res.status(201).json({ success: true, data: toMemberResponse(member) });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        return res.status(409).json({ success: false, message: "NIM atau email sudah terdaftar." });
      }
      return reportError(res, error, "create");
    }
  },

  async updateMember(req, res) {
    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "ID anggota tidak valid." });
      }
      const { nama, email, role } = req.body;
      if (
        typeof nama !== "string" || !nama.trim() ||
        typeof email !== "string" || !email.trim() ||
        (role !== "Pengurus" && role !== "Anggota")
      ) {
        return res.status(400).json({ success: false, message: "Nama, email, dan peran wajib diisi." });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const duplicateEmail = await Member.findOne({
        email: normalizedEmail,
        _id: { $ne: req.params.id },
      });
      if (duplicateEmail) {
        return res.status(409).json({ success: false, message: "Email sudah terdaftar." });
      }

      const member = await Member.findOneAndUpdate(
        { _id: req.params.id, aktif: { $ne: false } },
        { nama: nama.trim(), email: normalizedEmail, role },
        { new: true, runValidators: true },
      ).select("-passwordHash");
      if (!member) {
        return res.status(404).json({ success: false, message: "Anggota tidak ditemukan." });
      }
      const faceRegistered = await FaceTemplate.exists({ memberId: member._id, aktif: true });
      return res.status(200).json({ success: true, data: toMemberResponse(member, Boolean(faceRegistered)) });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        return res.status(409).json({ success: false, message: "Email sudah terdaftar." });
      }
      return reportError(res, error, "update");
    }
  },

  async deleteMember(req, res) {
    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "ID anggota tidak valid." });
      }
      const member = await Member.findOneAndUpdate(
        { _id: req.params.id, aktif: { $ne: false } },
        { aktif: false },
        { new: true },
      );
      if (!member) {
        return res.status(404).json({ success: false, message: "Anggota tidak ditemukan." });
      }
      await FaceTemplate.updateMany(
        { memberId: member._id, aktif: true },
        { aktif: false },
      );
      return res.status(200).json({ success: true, message: "Anggota berhasil dihapus." });
    } catch (error) {
      return reportError(res, error, "delete");
    }
  },

  async toggleMemberStatus(req, res) {
    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "ID anggota tidak valid." });
      }
      const member = await Member.findById(req.params.id);
      if (!member) {
        return res.status(404).json({ success: false, message: "Anggota tidak ditemukan." });
      }
      member.aktif = !member.aktif;
      await member.save();
      if (!member.aktif) {
        await FaceTemplate.updateMany(
          { memberId: member._id, aktif: true },
          { aktif: false },
        );
      }
      const faceRegistered = member.aktif
        ? await FaceTemplate.exists({ memberId: member._id, aktif: true })
        : false;
      return res.status(200).json({
        success: true,
        message: `Status anggota berhasil diubah menjadi ${member.aktif ? "Aktif" : "Nonaktif"}.`,
        data: toMemberResponse(member, Boolean(faceRegistered)),
      });
    } catch (error) {
      return reportError(res, error, "toggle-status");
    }
  },

  async resetFaceStatus(req, res) {
    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({ success: false, message: "ID anggota tidak valid." });
      }
      const member = await Member.findOne({ _id: req.params.id, aktif: { $ne: false } });
      if (!member) {
        return res.status(404).json({ success: false, message: "Anggota tidak ditemukan." });
      }
      await FaceTemplate.updateMany(
        { memberId: member._id, aktif: true },
        { aktif: false },
      );
      return res.status(200).json({ success: true, data: toMemberResponse(member) });
    } catch (error) {
      return reportError(res, error, "reset-face");
    }
  },
};

import Presensi from "../models/presensi.model.js";

/**
 * POST /presensi
 * Header: Authorization: Bearer <token>
 * Body: {
 *   kegiatanId: string,       — ID kegiatan (dari data kegiatan)
 *   kegiatanNama: string,     — nama kegiatan (dikirim dari frontend)
 *   metode?: string           — default "wajah+liveness"
 * }
 *
 * Menyimpan data presensi anggota.
 */
export const buatPresensi = async (req, res) => {
  try {
    const {
      kegiatanId,
      kegiatanNama = "Kegiatan HIMAFOR",
      metode = "wajah+liveness",
    } = req.body;

    const memberId = req.memberId;

    if (!kegiatanId) {
      return res.status(400).json({ message: "kegiatanId wajib diisi." });
    }

    // Cek apakah sudah presensi sebelumnya
    const sudahPresensi = await Presensi.findOne({
      member: memberId,
      kegiatanId,
    });
    if (sudahPresensi) {
      return res.status(409).json({
        message: "Kamu sudah melakukan presensi untuk kegiatan ini.",
      });
    }

    const waktuPresensi = new Date();

    // Simpan presensi
    const presensi = await Presensi.create({
      member: memberId,
      kegiatanId,
      kegiatanNama,
      waktuPresensi,
      metode,
      status: "hadir",
    });

    return res.status(201).json({
      message: "Presensi berhasil dicatat.",
      presensi: {
        id: presensi._id,
        kegiatanId: presensi.kegiatanId,
        kegiatanNama: presensi.kegiatanNama,
        waktuPresensi: presensi.waktuPresensi,
        metode: presensi.metode,
        status: presensi.status,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Kamu sudah melakukan presensi untuk kegiatan ini.",
      });
    }
    console.error("[buatPresensi]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /presensi/me
 * Header: Authorization: Bearer <token>
 *
 * Riwayat presensi milik anggota yang sedang login.
 */
export const riwayatPresensiSaya = async (req, res) => {
  try {
    const presensiList = await Presensi.find({ member: req.memberId })
      .sort({ waktuPresensi: -1 });

    return res.status(200).json({
      total: presensiList.length,
      data: presensiList.map((p) => ({
        id: p._id,
        kegiatanId: p.kegiatanId,
        kegiatanNama: p.kegiatanNama,
        waktuPresensi: p.waktuPresensi,
        metode: p.metode,
        status: p.status,
      })),
    });
  } catch (err) {
    console.error("[riwayatPresensiSaya]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /presensi/kegiatan/:kegiatanId
 * Header: Authorization: Bearer <token> (admin only)
 *
 * Rekap presensi untuk satu kegiatan.
 */
export const rekapPresensiKegiatan = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({
        message: "Hanya admin yang dapat mengakses rekap presensi.",
      });
    }

    const { kegiatanId } = req.params;

    const presensiList = await Presensi.find({ kegiatanId })
      .populate("member", "nama nim jabatan departemen")
      .sort({ waktuPresensi: 1 });

    return res.status(200).json({
      kegiatanId,
      kegiatanNama: presensiList[0]?.kegiatanNama ?? "-",
      totalHadir: presensiList.length,
      data: presensiList.map((p) => ({
        id: p._id,
        member: {
          id: p.member._id,
          nama: p.member.nama,
          nim: p.member.nim,
          jabatan: p.member.jabatan,
          departemen: p.member.departemen,
        },
        waktuPresensi: p.waktuPresensi,
        metode: p.metode,
        status: p.status,
      })),
    });
  } catch (err) {
    console.error("[rekapPresensiKegiatan]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

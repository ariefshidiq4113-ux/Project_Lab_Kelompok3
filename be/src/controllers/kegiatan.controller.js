import Kegiatan from "../models/kegiatan.model.js";

/**
 * GET /kegiatan
 * Header: Authorization: Bearer <token>
 * Query: ?aktif=true
 *
 * Daftar semua kegiatan.
 */
export const daftarKegiatan = async (req, res) => {
  try {
    const kegiatan = await Kegiatan.find({ aktif: true })
      .sort({ tanggal: -1 })
      .populate("dibuatOleh", "nama");

    return res.status(200).json({ total: kegiatan.length, data: kegiatan });
  } catch (err) {
    console.error("[daftarKegiatan]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /kegiatan/:id
 * Header: Authorization: Bearer <token>
 */
export const detailKegiatan = async (req, res) => {
  try {
    const kegiatan = await Kegiatan.findById(req.params.id).populate("dibuatOleh", "nama");
    if (!kegiatan || !kegiatan.aktif) {
      return res.status(404).json({ message: "Kegiatan tidak ditemukan." });
    }
    return res.status(200).json({ kegiatan });
  } catch (err) {
    console.error("[detailKegiatan]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * POST /kegiatan
 * Header: Authorization: Bearer <token> (admin only)
 * Body: { nama, tanggal, waktuMulai, waktuSelesai, lokasi?, deskripsi? }
 */
export const buatKegiatan = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Hanya admin yang dapat membuat kegiatan." });
    }

    const { nama, tanggal, waktuMulai, waktuSelesai, lokasi, deskripsi } = req.body;

    if (!nama || !tanggal || !waktuMulai || !waktuSelesai) {
      return res.status(400).json({ message: "nama, tanggal, waktuMulai, waktuSelesai wajib diisi." });
    }

    const kegiatan = await Kegiatan.create({
      nama,
      tanggal: new Date(tanggal),
      waktuMulai,
      waktuSelesai,
      lokasi,
      deskripsi,
      dibuatOleh: req.memberId,
    });

    return res.status(201).json({ message: "Kegiatan berhasil dibuat.", kegiatan });
  } catch (err) {
    console.error("[buatKegiatan]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * PATCH /kegiatan/:id/sesi
 * Header: Authorization: Bearer <token> (admin only)
 * Body: { buka: boolean }
 *
 * Buka/tutup sesi presensi untuk kegiatan.
 */
export const toggleSesiPresensi = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: "Hanya admin yang dapat mengubah sesi." });
    }

    const { buka } = req.body;
    if (typeof buka !== "boolean") {
      return res.status(400).json({ message: "Field 'buka' harus boolean." });
    }

    const kegiatan = await Kegiatan.findById(req.params.id);
    if (!kegiatan || !kegiatan.aktif) {
      return res.status(404).json({ message: "Kegiatan tidak ditemukan." });
    }

    kegiatan.sesiDibuka = buka;
    if (buka) kegiatan.sesiDibukaPada = new Date();
    else kegiatan.sesiDitutupPada = new Date();

    await kegiatan.save();

    return res.status(200).json({
      message: buka ? "Sesi presensi dibuka." : "Sesi presensi ditutup.",
      kegiatan: {
        id: kegiatan._id,
        nama: kegiatan.nama,
        sesiDibuka: kegiatan.sesiDibuka,
      },
    });
  } catch (err) {
    console.error("[toggleSesiPresensi]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

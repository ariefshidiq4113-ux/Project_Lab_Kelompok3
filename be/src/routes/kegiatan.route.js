import { Router } from "express";
import {
  daftarKegiatan,
  detailKegiatan,
  buatKegiatan,
  toggleSesiPresensi,
} from "../controllers/kegiatan.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const kegiatanRouter = Router();

// Semua route butuh token
kegiatanRouter.use(requireAuth);

// GET /kegiatan — daftar semua kegiatan
kegiatanRouter.get("/", daftarKegiatan);

// GET /kegiatan/:id — detail kegiatan
kegiatanRouter.get("/:id", detailKegiatan);

// POST /kegiatan — buat kegiatan baru (admin)
kegiatanRouter.post("/", buatKegiatan);

// PATCH /kegiatan/:id/sesi — buka/tutup sesi presensi (admin)
kegiatanRouter.patch("/:id/sesi", toggleSesiPresensi);

export default kegiatanRouter;

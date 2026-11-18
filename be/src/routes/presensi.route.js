import { Router } from "express";
import {
  buatPresensi,
  riwayatPresensiSaya,
  rekapPresensiKegiatan,
} from "../controllers/presensi.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const presensiRouter = Router();

// Semua route butuh token
presensiRouter.use(requireAuth);

// POST /presensi — simpan presensi baru
presensiRouter.post("/", buatPresensi);

// GET /presensi/me — riwayat presensi saya
presensiRouter.get("/me", riwayatPresensiSaya);

// GET /presensi/kegiatan/:kegiatanId — rekap per kegiatan (admin)
presensiRouter.get("/kegiatan/:kegiatanId", rekapPresensiKegiatan);

export default presensiRouter;

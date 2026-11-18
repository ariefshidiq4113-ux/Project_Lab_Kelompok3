import { Router } from "express";
import { attendanceController } from "../controllers/attendance.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.patch("/session/:eventId", attendanceController.toggleSession);
router.get("/session/:eventId", attendanceController.getAttendanceByEvent);
router.post("/submit", attendanceController.submitAttendance);
router.post("/manual", attendanceController.createManualAttendance);
router.patch("/session/:eventId/records/:recordId", attendanceController.updateAttendance);
router.delete("/session/:eventId/records/:recordId", attendanceController.deleteAttendance);
router.get("/recap", attendanceController.getRecapData);
router.get("/my-history", requireAuth, attendanceController.getMyAttendanceHistory);

export default router;

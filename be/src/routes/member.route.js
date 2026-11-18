/**
 * memberRoutes.js
 * Routing untuk manajemen anggota HIMAFOR
 */

import { Router } from "express";
import { memberController } from "../controllers/member.controller.js";

const router = Router();

router.get("/", memberController.getAllMembers);
router.get("/:id", memberController.getMemberById);
router.post("/", memberController.createMember);
router.put("/:id", memberController.updateMember);
router.delete("/:id", memberController.deleteMember);
router.patch("/:id/toggle-status", memberController.toggleMemberStatus);
router.patch("/:id/reset-face", memberController.resetFaceStatus);

export default router;
import { Router } from "express";
import { activityController } from "../controllers/activity.controller.js";

const router = Router();

router.get("/", activityController.getAllEvents);
router.get("/:id", activityController.getEventById);
router.post("/", activityController.createEvent);
router.put("/:id", activityController.updateEvent);
router.patch("/:id/status", activityController.updateEventStatus);
router.delete("/:id", activityController.deleteEvent);

export default router;

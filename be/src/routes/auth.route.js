import { Router } from "express";
import { login, changePassword, getMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const authRouter = Router();

// Public
authRouter.post("/login", login);

// Protected (perlu token)
authRouter.get("/me", requireAuth, getMe);
authRouter.post("/change-password", requireAuth, changePassword);

export default authRouter;
